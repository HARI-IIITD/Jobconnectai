from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import numpy as np
import os
import json

def extract_text_from_json(json_path):
    """Combine all text fields from the parsed CV JSON file."""
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    # Combine all string fields (skills, experience, education, etc.)
    text_parts = []
    for key, value in data.items():
        if isinstance(value, str):
            text_parts.append(value)
        elif isinstance(value, list):
            text_parts.extend([str(v) for v in value])
        elif isinstance(value, dict):
            text_parts.extend([str(v) for v in value.values()])
    return " ".join(text_parts)

def rank_cvs_in_sector(sector_dir):
    json_files = [f for f in os.listdir(sector_dir) if f.endswith(".json")]
    if not json_files:
        return {}

    # Extract text from each JSON
    texts = [extract_text_from_json(os.path.join(sector_dir, f)) for f in json_files]

    # Step 1: TF-IDF encoding
    vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
    tfidf_matrix = vectorizer.fit_transform(texts)

    # Step 2: Cosine similarity between all CVs
    similarity_matrix = cosine_similarity(tfidf_matrix)

    # Step 3: Calculate average similarity for each CV
    avg_scores = similarity_matrix.mean(axis=1)

    # Step 4: Normalize to 0–100 range
    scaler = MinMaxScaler((0, 100))
    normalized_scores = scaler.fit_transform(avg_scores.reshape(-1, 1)).flatten()

    # Step 5: Create dictionary with scores
    sector_scores = {
        json_files[i]: round(float(normalized_scores[i]), 2)
        for i in range(len(json_files))
    }

    return sector_scores
