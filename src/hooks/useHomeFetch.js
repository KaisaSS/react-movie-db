import { useState, useEffect } from "react";
// API
import API from "../API";
//Helpers
import { isPersistedState } from "../helpers";

// Create initial state
const initialState = {
  page: 0,
  results: [],
  total_pages: 0,
  total_results: 0,
};

export const useHomeFetch = () => {
  // State for searchBar
  const [searchTerm, setSearchTerm] = useState("");
  // State for holding the movies
  const [state, setState] = useState(initialState);
  // State for loading
  const [loading, setLoading] = useState(false);
  // State for if error is received from API
  const [error, setError] = useState(false);
  // State for loading more movies
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Function to fetch movies from the API
  const fetchMovies = async (page, searchTerm = "") => {
    try {
      setError(false);
      setLoading(true);

      const movies = await API.fetchMovies(searchTerm, page);

      setState((prev) => ({
        ...movies,
        results: page > 1 ? [...prev.results, ...movies.results] : [...movies.results],
      }));
    } catch (error) {
      setError(true);
    }
    setLoading(false);
  };

  // Initial and search
  useEffect(() => {
    if (!searchTerm) {
      const sessionState = isPersistedState("homeState");

      if (sessionState) {
        setState(sessionState);
        return;
      }
    }

    setState(initialState);
    fetchMovies(1, searchTerm); // want to fetch the first page
  }, [searchTerm]); // useEffect will trigger when search term changes

  // Load more
  useEffect(() => {
    if (!isLoadingMore) return;
    fetchMovies(state.page + 1, searchTerm);
    setIsLoadingMore(false);
  }, [isLoadingMore, searchTerm, state.page]);

  // Write ro sessionStorage
  useEffect(() => {
    if (!searchTerm) sessionStorage.setItem("homeState", JSON.stringify(state));
  }, [searchTerm, state]);

  return { state, loading, error, searchTerm, setSearchTerm, setIsLoadingMore };
};
