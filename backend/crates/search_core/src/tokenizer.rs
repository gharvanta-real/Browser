pub fn tokenize(input: &str) -> Vec<String> {
    input
        .split(|ch: char| !ch.is_alphanumeric())
        .filter_map(|raw| {
            let token = raw.trim().to_lowercase();
            if token.len() < 2 || STOP_WORDS.contains(&token.as_str()) {
                None
            } else {
                Some(token)
            }
        })
        .collect()
}

const STOP_WORDS: &[&str] = &[
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "in", "is", "it", "of",
    "on", "or", "that", "the", "this", "to", "was", "what", "when", "where", "with",
];
