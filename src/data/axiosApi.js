import axios from 'axios';

/**
 * AXIOS FUNDAMENTALS
 *
 * 1. Creating Instance vs Direct Usage:
 * - You can use axios directly: axios.get('url') if you have a single API
 * - Creating instance (axios.create) is useful for:
 *   a) Multiple base URLs in your app
 *   b) Different default configs for different APIs
 *   c) Reusable configuration
 *
 * 2. PUT vs PATCH:
 * - PUT: Replaces the entire resource
 * - PATCH: Partially updates the resource
 * Example: If you have a user with {name, age, email} and only want to update email,
 * use PATCH to only send the email field
 *
 * 3. Request Cancellation:
 * - Axios provides AbortController for canceling requests
 * - Useful for preventing race conditions or stopping unnecessary requests
 * - Fetch also supports AbortController, but Axios makes it easier
 */

// Method 1: Creating an axios instance (recommended for multiple API calls)
const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000, // Request will fail after 10 seconds
  headers: {'Content-Type': 'application/json'},
});

// Method 2: Direct axios usage example (for single API calls)
// axios.get('https://api.example.com/data')

const ApiService = {
  /**
   * GET Request with Query Parameters
   * Two ways to pass params:
   * 1. In config object (used here): api.get('/posts', { params: { _limit: 5 } })
   * 2. In URL directly: api.get('/posts?_limit=5')
   */
  async getPosts(limit = 10) {
    // Create an abort controller for request cancellation
    const controller = new AbortController();

    try {
      const response = await axios.get(
        'https://jsonplaceholder.typicode.com/posts',
        {
          timeout: 10000, // Request will fail after 10 seconds
          headers: {'Content-Type': 'application/json'},
          params: {_limit: limit},
          signal: controller.signal, // Add signal for cancellation
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
      } else {
        console.error('Fetch Posts Error:', error);
      }
      throw error;
    }

    // Example of how to cancel this request:
    // controller.abort();
  },

  /**
   * POST Request
   * - Data is sent in request body
   * - No need for params in URL for POST
   */
  async createPost(postData) {
    try {
      const response = await api.post('/posts', postData);
      return response.data;
    } catch (error) {
      console.error('Create Post Error:', error);
      throw error;
    }
  },

  /**
   * PATCH Request
   * - Used here instead of PUT because we're doing partial updates
   * - URL params are part of the route: /posts/1
   * - Data to update is sent in body
   */
  async updatePost(postId, updateData) {
    try {
      const response = await api.patch(`/posts/${postId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update Post Error:', error);
      throw error;
    }
  },

  /**
   * DELETE Request
   * - Only needs URL parameter
   * - No request body needed
   */
  async deletePost(postId) {
    try {
      await api.delete(`/posts/${postId}`);
      return true;
    } catch (error) {
      console.error('Delete Post Error:', error);
      throw error;
    }
  },
};

/**
 * AXIOS vs FETCH Key Differences:
 * 1. Automatic JSON Parsing
 *    - Axios: Automatically transforms JSON data
 *    - Fetch: Requires manual .json() call
 *
 * 2. Error Handling
 *    - Axios: Rejects promise on 400-500 status codes
 *    - Fetch: Only rejects on network failure
 *
 * 3. Request Cancellation
 *    - Axios: Built-in support via AbortController
 *    - Fetch: Requires more manual setup
 *
 * 4. Request Config
 *    - Axios: Single config object
 *    - Fetch: Requires more verbose config
 *
 * Example of same request in Fetch vs Axios:
 *
 * Fetch:
 * fetch('api/data', {
 *   method: 'POST',
 *   headers: {'Content-Type': 'application/json'},
 *   body: JSON.stringify(data)
 * }).then(res => res.json())
 *
 * Axios:
 * axios.post('api/data', data)
 */

export default ApiService;
