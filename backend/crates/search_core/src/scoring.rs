use crate::IndexedDocument;

#[derive(Debug, Copy, Clone)]
pub struct SearchWeights {
    pub title_boost: f32,
    pub url_boost: f32,
    pub tag_boost: f32,
    pub body_boost: f32,
}

impl Default for SearchWeights {
    fn default() -> Self {
        Self {
            title_boost: 4.0,
            url_boost: 2.0,
            tag_boost: 3.0,
            body_boost: 1.0,
        }
    }
}

pub(crate) fn score_document(
    indexed: &IndexedDocument,
    query_tokens: &[String],
    corpus_size: usize,
    weights: SearchWeights,
) -> f32 {
    let mut score = 0.0;
    let title = indexed.document.title.to_lowercase();
    let url = indexed
        .document
        .url
        .as_deref()
        .unwrap_or_default()
        .to_lowercase();
    let tags = indexed.document.tags.join(" ").to_lowercase();

    for token in query_tokens {
        let term_frequency = indexed.token_counts.get(token).copied().unwrap_or_default() as f32;
        if term_frequency == 0.0 {
            continue;
        }

        let normalized_tf = term_frequency / indexed.token_total.max(1) as f32;
        let idf = (1.0 + corpus_size as f32).ln();
        score += normalized_tf * idf * weights.body_boost;

        if title.contains(token) {
            score += weights.title_boost;
        }
        if url.contains(token) {
            score += weights.url_boost;
        }
        if tags.contains(token) {
            score += weights.tag_boost;
        }
    }

    score
}
