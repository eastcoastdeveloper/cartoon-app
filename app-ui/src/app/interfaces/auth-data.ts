export interface AuthData {
  username?: string;
  email: string;
  password: string;
  city?: string;
  state?: string;
  country?: string;
  showLocation?: boolean;
  showCountry?: boolean;
  captions?: [];
  roles?: [];
}
