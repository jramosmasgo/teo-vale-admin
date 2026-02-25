export interface User {
  _id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  profileImageUrl?: string; // Cloudinary image URL
  password?: string;
  role?: string;
  status?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}
