// src/pages/api/blogApi.ts

// *** CRUCIAL IMPORT: Use the 'api' instance that includes the JWT token ***
import { api } from "@/api";
import { BlogPost } from "@/types";

/**
 * Fetches all blog posts, optionally filtered by status.
 * @param status - Optional status to filter by (e.g., 'published', 'pending', 'all')
 */
export const fetchBlogPosts = async (status?: string): Promise<BlogPost[]> => {
  let url = `blogs/`;

  if (status && status !== 'all') {
    // Django ViewSet uses this query param
    url += `?status=${status}`;
  }

  console.log('API Call: Fetching blogs from:', api.defaults.baseURL + url); // Debug Check

  // Use the authenticated 'api' instance
  const response = await api.get<BlogPost[]>(url);

  return response.data;
};


/**
 * Creates a new blog post. (POST Request - Requires Auth)
 */
export const createBlogPost = async (postData: {
  title: string;
  content: string;
  excerpt: string;
  tags: string; // Sending as comma-separated string
  status: BlogPost["status"];
}): Promise<BlogPost> => {
  const payload = {
    ...postData,
    // Our Django Serializer expects 'tags_input' for creation
    tags_input: postData.tags,
  };

  console.log('API Call: Creating blog post with payload:', payload); // Debug Check

  // Use the authenticated 'api' instance for POST
  const response = await api.post<BlogPost>("blogs/", payload);

  return response.data;
};

/**
 * Deletes a blog post by ID. (DELETE Request - Requires Auth)
 */
export const deleteBlogPost = async (id: string): Promise<void> => {
    // Use the authenticated 'api' instance for DELETE
    await api.delete(`blogs/${id}/`);
};

/**
 * Updates an existing blog post. (PUT/PATCH Request - Requires Auth)
 */
export const updateBlogPost = async (
  id: string,
  postData: {
    title: string;
    content: string;
    excerpt: string;
    tags: string; // Comma-separated string
    status: BlogPost["status"];
  }
): Promise<BlogPost> => {
  const payload = {
    ...postData,
    tags_input: postData.tags,
  };

  // Use the authenticated 'api' instance for PUT/PATCH
  const response = await api.patch<BlogPost>(`blogs/${id}/`, payload); // PATCH is usually better for partial updates

  return response.data;
};
