from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import faiss  # type: ignore
import numpy as np


EMBEDDING_DIM: int = 512
INDEX_FILENAME: str = "faiss.index"
METADATA_FILENAME: str = "metadata.json"


def _ensure_directory(path: str | Path) -> Path:
    """
    Ensures that the given directory exists and returns it as a Path object.

    Args:
        path: Directory path to ensure exists.

    Returns:
        Path: The directory path as a Path object.
    """
    dir_path = Path(path)
    dir_path.mkdir(parents=True, exist_ok=True)
    return dir_path


def create_index(dim: int = EMBEDDING_DIM) -> faiss.IndexFlatL2:
    """
    Creates and returns a new empty FAISS flat L2 index.

    Args:
        dim: Dimensionality of the embedding vectors.

    Returns:
        faiss.IndexFlatL2: A new FAISS IndexFlatL2 instance.
    """
    if dim <= 0:
        raise ValueError("Dimension 'dim' must be a positive integer.")
    return faiss.IndexFlatL2(dim)


def add_embedding(
    index: faiss.IndexFlatL2,
    embedding: list[float],
    metadata: dict[str, Any],
    metadata_store: list[dict[str, Any]],
) -> None:
    """
    Adds a single embedding to the index and updates the metadata store.

    Args:
        index: The FAISS index to which the embedding will be added.
        embedding: The 1D embedding vector as a list of floats.
        metadata: A dictionary containing metadata for the embedding. Must
            contain keys: {"class": str, "image_id": str, "detection_id": int}.
        metadata_store: List used to store metadata aligned with index vectors.

    Raises:
        ValueError: If the embedding dimension does not match the index or
            required metadata fields are missing.
    """
    required_keys = {"class", "image_id", "detection_id"}
    if not required_keys.issubset(metadata.keys()):
        missing = required_keys.difference(metadata.keys())
        raise ValueError(f"Missing required metadata keys: {missing}")

    embedding_array = np.asarray(embedding, dtype="float32")
    if embedding_array.ndim != 1:
        raise ValueError("Embedding must be a 1D vector.")
    if embedding_array.shape[0] != index.d:
        raise ValueError(
            f"Embedding dimension {embedding_array.shape[0]} does not match index dimension {index.d}."
        )

    embedding_array = embedding_array.reshape(1, -1)
    index.add(embedding_array)
    metadata_store.append(metadata)


def search_embedding(
    index: faiss.IndexFlatL2,
    query_embedding: list[float],
    metadata_store: list[dict[str, Any]],
    top_k: int = 5,
) -> list[dict[str, Any]]:
    """
    Searches FAISS index for top_k nearest neighbors.

    Args:
        index: The FAISS index to search.
        query_embedding: The query embedding vector as a list of floats.
        metadata_store: Metadata list aligned with vectors stored in the index.
        top_k: Number of nearest neighbors to return.

    Returns:
        List[dict[str, Any]]: A list of search results with fields:
            [{"rank": int, "distance": float, "class": str, "image_id": str}]
            Results are ordered by ascending distance (best match first).
    """
    if index.ntotal == 0:
        return []

    if top_k <= 0:
        return []

    query_array = np.asarray(query_embedding, dtype="float32")
    if query_array.ndim != 1:
        raise ValueError("Query embedding must be a 1D vector.")
    if query_array.shape[0] != index.d:
        raise ValueError(
            f"Query embedding dimension {query_array.shape[0]} does not match index dimension {index.d}."
        )

    query_array = query_array.reshape(1, -1)
    k = min(top_k, index.ntotal)
    distances, indices = index.search(query_array, k)

    results: list[dict[str, Any]] = []
    for rank, (dist, idx) in enumerate(zip(distances[0], indices[0]), start=1):
        if idx < 0 or idx >= len(metadata_store):
            continue
        meta = metadata_store[idx]
        results.append(
            {
                "rank": rank,
                "distance": float(dist),
                "class": str(meta.get("class", "")),
                "image_id": str(meta.get("image_id", "")),
            }
        )
    return results


def save_index(
    index: faiss.IndexFlatL2,
    metadata_store: list[dict[str, Any]],
    path: str = "vector_store/index_store/",
) -> None:
    """
    Saves FAISS index and metadata JSON to disk.

    Args:
        index: The FAISS index to save.
        metadata_store: Metadata list aligned with vectors stored in the index.
        path: Directory path where the index and metadata will be stored.
    """
    dir_path = _ensure_directory(path)
    index_path = dir_path / INDEX_FILENAME
    metadata_path = dir_path / METADATA_FILENAME

    faiss.write_index(index, str(index_path))
    with metadata_path.open("w", encoding="utf-8") as f:
        json.dump(metadata_store, f, ensure_ascii=False, indent=2)


def load_index(
    path: str = "vector_store/index_store/",
) -> tuple[faiss.IndexFlatL2, list[dict[str, Any]]]:
    """
    Loads FAISS index and metadata from disk.

    Args:
        path: Directory path from which to load the index and metadata.

    Returns:
        Tuple[faiss.IndexFlatL2, list[dict[str, Any]]]: The loaded index and
        its corresponding metadata store.

    Raises:
        FileNotFoundError: If the index file or metadata file does not exist.
        json.JSONDecodeError: If the metadata file cannot be decoded.
    """
    dir_path = Path(path)
    index_path = dir_path / INDEX_FILENAME
    metadata_path = dir_path / METADATA_FILENAME

    if not index_path.is_file():
        raise FileNotFoundError(f"FAISS index file not found at {index_path}")
    if not metadata_path.is_file():
        raise FileNotFoundError(f"Metadata file not found at {metadata_path}")

    index = faiss.read_index(str(index_path))
    with metadata_path.open("r", encoding="utf-8") as f:
        metadata_store: list[dict[str, Any]] = json.load(f)

    return index, metadata_store


def get_index_size(index: faiss.IndexFlatL2) -> int:
    """
    Returns number of vectors stored in the index.

    Args:
        index: The FAISS index to inspect.

    Returns:
        int: Number of vectors in the index.
    """
    return int(index.ntotal)


if __name__ == "__main__":
    # Quick validation of index creation, add/search, and persistence.
    rng = np.random.default_rng(seed=42)

    idx = create_index()
    metadata_store_main: list[dict[str, Any]] = []

    # Add three random embeddings with mock metadata.
    for i in range(3):
        emb = rng.random(EMBEDDING_DIM, dtype="float32").tolist()
        meta = {
            "class": "submarine",
            "image_id": f"img_{i}.jpg",
            "detection_id": i,
        }
        add_embedding(idx, emb, meta, metadata_store_main)

    # Search with a fourth random embedding.
    query_emb = rng.random(EMBEDDING_DIM, dtype="float32").tolist()
    search_results = search_embedding(
        idx,
        query_emb,
        metadata_store_main,
        top_k=2,
    )
    print("Search results (top 2):", search_results)

    # Save and reload index, confirming size matches.
    save_index(idx, metadata_store_main)
    loaded_idx, loaded_metadata = load_index()

    original_size = get_index_size(idx)
    loaded_size = get_index_size(loaded_idx)
    print(f"Original index size: {original_size}")
    print(f"Loaded index size:   {loaded_size}")
    print("Metadata length match:", len(metadata_store_main) == len(loaded_metadata))

