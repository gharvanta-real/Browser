mod scoring;
mod tokenizer;

use chrono::{DateTime, Utc};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use uuid::Uuid;

pub use scoring::SearchWeights;
pub use tokenizer::tokenize;

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum DocumentKind {
    Bookmark,
    History,
    Tab,
    ReadingList,
    Download,
    PageSnapshot,
    Workspace,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchDocument {
    pub id: String,
    pub kind: DocumentKind,
    pub title: String,
    pub url: Option<String>,
    pub body: String,
    pub tags: Vec<String>,
    pub source: String,
    pub updated_at: DateTime<Utc>,
}

impl SearchDocument {
    pub fn weighted_text(&self) -> String {
        format!(
            "{} {} {} {}",
            self.title,
            self.url.as_deref().unwrap_or_default(),
            self.tags.join(" "),
            self.body
        )
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexDocumentsRequest {
    pub documents: Vec<SearchDocument>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexDocumentsResponse {
    pub indexed: usize,
    pub total_documents: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchQuery {
    pub query: String,
    pub limit: Option<usize>,
    pub kinds: Option<Vec<DocumentKind>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchHit {
    pub id: String,
    pub kind: DocumentKind,
    pub title: String,
    pub url: Option<String>,
    pub snippet: String,
    pub score: f32,
    pub source: String,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResponse {
    pub request_id: Uuid,
    pub query: String,
    pub hits: Vec<SearchHit>,
}

#[derive(Debug, thiserror::Error)]
pub enum SearchError {
    #[error("search query is empty")]
    EmptyQuery,
}

#[derive(Debug, Clone)]
struct IndexedDocument {
    document: SearchDocument,
    token_counts: HashMap<String, usize>,
    token_total: usize,
}

#[derive(Debug, Default)]
struct SearchIndexInner {
    documents: HashMap<String, IndexedDocument>,
    inverted: HashMap<String, HashSet<String>>,
}

#[derive(Debug, Clone, Default)]
pub struct SearchIndex {
    inner: Arc<RwLock<SearchIndexInner>>,
}

impl SearchIndex {
    pub fn upsert_many(&self, documents: Vec<SearchDocument>) -> IndexDocumentsResponse {
        let indexed = documents.len();
        let mut inner = self.inner.write();

        for document in documents {
            if let Some(existing) = inner.documents.remove(&document.id) {
                for token in existing.token_counts.keys() {
                    if let Some(ids) = inner.inverted.get_mut(token) {
                        ids.remove(&document.id);
                        if ids.is_empty() {
                            inner.inverted.remove(token);
                        }
                    }
                }
            }

            let tokens = tokenize(&document.weighted_text());
            let mut token_counts = HashMap::new();
            for token in tokens {
                *token_counts.entry(token).or_insert(0) += 1;
            }
            let token_total = token_counts.values().sum();

            for token in token_counts.keys() {
                inner
                    .inverted
                    .entry(token.clone())
                    .or_default()
                    .insert(document.id.clone());
            }

            inner.documents.insert(
                document.id.clone(),
                IndexedDocument {
                    document,
                    token_counts,
                    token_total,
                },
            );
        }

        IndexDocumentsResponse {
            indexed,
            total_documents: inner.documents.len(),
        }
    }

    pub fn search(&self, query: SearchQuery) -> Result<SearchResponse, SearchError> {
        let tokens = tokenize(&query.query);
        if tokens.is_empty() {
            return Err(SearchError::EmptyQuery);
        }

        let limit = query.limit.unwrap_or(10).clamp(1, 50);
        let allowed_kinds = query
            .kinds
            .as_ref()
            .map(|kinds| kinds.iter().cloned().collect::<HashSet<_>>());
        let inner = self.inner.read();
        let mut candidates = HashSet::new();

        for token in &tokens {
            if let Some(ids) = inner.inverted.get(token) {
                candidates.extend(ids.iter().cloned());
            }
        }

        let weights = SearchWeights::default();
        let mut hits = candidates
            .into_iter()
            .filter_map(|id| inner.documents.get(&id))
            .filter(|indexed| {
                allowed_kinds
                    .as_ref()
                    .is_none_or(|kinds| kinds.contains(&indexed.document.kind))
            })
            .map(|indexed| {
                let score =
                    scoring::score_document(indexed, &tokens, inner.documents.len(), weights);
                SearchHit {
                    id: indexed.document.id.clone(),
                    kind: indexed.document.kind.clone(),
                    title: indexed.document.title.clone(),
                    url: indexed.document.url.clone(),
                    snippet: snippet(&indexed.document.body, &tokens),
                    score,
                    source: indexed.document.source.clone(),
                    updated_at: indexed.document.updated_at,
                }
            })
            .filter(|hit| hit.score > 0.0)
            .collect::<Vec<_>>();

        hits.sort_by(|a, b| {
            b.score
                .total_cmp(&a.score)
                .then_with(|| a.title.cmp(&b.title))
        });
        hits.truncate(limit);

        Ok(SearchResponse {
            request_id: Uuid::new_v4(),
            query: query.query,
            hits,
        })
    }

    pub fn len(&self) -> usize {
        self.inner.read().documents.len()
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }
}

fn snippet(body: &str, tokens: &[String]) -> String {
    let lower = body.to_lowercase();
    let first_match = tokens
        .iter()
        .filter_map(|token| lower.find(token))
        .min()
        .unwrap_or(0);

    let start = first_match.saturating_sub(80);
    let mut end = (first_match + 180).min(body.len());
    while end < body.len() && !body.is_char_boundary(end) {
        end += 1;
    }

    let mut start_boundary = start;
    while start_boundary > 0 && !body.is_char_boundary(start_boundary) {
        start_boundary -= 1;
    }

    let excerpt = body[start_boundary..end].trim();
    if excerpt.is_empty() {
        body.chars().take(180).collect()
    } else {
        excerpt.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn doc(id: &str, title: &str, body: &str, kind: DocumentKind) -> SearchDocument {
        SearchDocument {
            id: id.to_string(),
            kind,
            title: title.to_string(),
            url: Some(format!("https://example.com/{id}")),
            body: body.to_string(),
            tags: vec!["test".to_string()],
            source: "unit".to_string(),
            updated_at: Utc::now(),
        }
    }

    #[test]
    fn finds_title_and_body_matches() {
        let index = SearchIndex::default();
        index.upsert_many(vec![
            doc(
                "a",
                "Aero browser architecture",
                "Rust backend with local search.",
                DocumentKind::Bookmark,
            ),
            doc("b", "Cooking notes", "Pantry index.", DocumentKind::History),
        ]);

        let results = index
            .search(SearchQuery {
                query: "rust browser".to_string(),
                limit: Some(5),
                kinds: None,
            })
            .unwrap();

        assert_eq!(results.hits[0].id, "a");
    }

    #[test]
    fn respects_kind_filter() {
        let index = SearchIndex::default();
        index.upsert_many(vec![
            doc("a", "Rust tab", "browser", DocumentKind::Tab),
            doc("b", "Rust bookmark", "browser", DocumentKind::Bookmark),
        ]);

        let results = index
            .search(SearchQuery {
                query: "rust".to_string(),
                limit: Some(5),
                kinds: Some(vec![DocumentKind::Bookmark]),
            })
            .unwrap();

        assert_eq!(results.hits.len(), 1);
        assert_eq!(results.hits[0].kind, DocumentKind::Bookmark);
    }
}
