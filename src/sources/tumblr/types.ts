export interface TumblrResponseRoot {
  meta: TumblrMeta;
  response: TumblrResponse;
}

export interface TumblrMeta {
  status: number;
  msg: string;
}

export interface TumblrResponse {
  blog: TumblrBlog;
  posts: TumblrPost[];
  total_posts: number;
  _links: TumblrLinks;
}

export interface TumblrBlog {
  ask: boolean;
  ask_anon: boolean;
  ask_page_title: string;
  asks_allow_media: boolean;
  avatar: TumblrUserAvatar[];
  can_chat: boolean;
  can_subscribe: boolean;
  description: string;
  is_nsfw: boolean;
  name: string;
  posts: number;
  share_likes: boolean;
  share_replies: boolean;
  subscribed: boolean;
  theme_id: number;
  theme: TumblrBlogTheme;
  title: string;
  total_posts: number;
  updated: number;
  url: string;
  uuid: string;
}

export interface TumblrUserAvatar {
  width: number;
  height: number;
  url: string;
  accessories: any[];
}

export interface TumblrBlogTheme {
  header_full_width: number;
  header_full_height: number;
  header_focus_width: number;
  header_focus_height: number;
  avatar_shape: string;
  background_color: string;
  body_font: string;
  header_bounds: string;
  header_image: string;
  header_image_focused: string;
  header_image_poster: string;
  header_image_scaled: string;
  header_stretch: boolean;
  link_color: string;
  show_avatar: boolean;
  show_description: boolean;
  show_header_image: boolean;
  show_title: boolean;
  title_color: string;
  title_font: string;
  title_font_weight: string;
}

export interface TumblrPost {
  type: string;
  is_blocks_post_format: boolean;
  blog_name: string;
  blog: TumblrPostBlog;
  id: number;
  id_string: string;
  is_blazed: boolean;
  is_blaze_pending: boolean;
  can_blaze: boolean;
  post_url: string;
  parent_post_url: string;
  slug: string;
  date: string;
  timestamp: number;
  state: string;
  format: string;
  reblog_key: string;
  tags: string[];
  short_url: string;
  summary: string;
  should_open_in_legacy: boolean;
  recommended_source: any;
  recommended_color: any;
  note_count: number;
  title?: string;
  body: string;
  reblog: TumblrPostReblog;
  trail: TumblrPostTrail[];
  can_like: boolean;
  interactability_reblog: string;
  can_reblog: boolean;
  interactability_blaze: string;
  can_send_in_message: boolean;
  can_reply: boolean;
  display_avatar: boolean;
}

export interface TumblrPostBlog {
  name: string;
  title: string;
  description: string;
  url: string;
  uuid: string;
  updated: number;
  avatar: TumblrPostAvatar[];
  tumblrmart_accessories: TumblrmartAccessories;
  can_show_badges: boolean;
}

export interface TumblrPostAvatar {
  width: number;
  height: number;
  url: string;
  accessories: any[];
}

export interface TumblrmartAccessories { }

export interface TumblrPostReblog {
  comment: string;
  tree_html: string;
}

export interface TumblrPostTrail {
  blog: TumblrTrailBlog;
  post: TumblrTrailPost;
  content_raw: string;
  content: string;
  is_root_item?: boolean;
}

export interface TumblrTrailBlog {
  name: string;
  active: boolean;
  theme: any;
  share_likes: boolean;
  share_following: boolean;
  can_be_followed: boolean;
}

export interface TumblrTrailPost {
  id: string;
}

export interface TumblrLinks {
  next: TumblrNext;
}

export interface TumblrNext {
  href: string;
  method: string;
  query_params: TumblrQueryParams;
}

export interface TumblrQueryParams {
  type: string;
  tumblelog: string;
  page_number: string;
}

export interface TumblrNormalizedPost {
  kind: "post";
  title: string;
  source: "tumblr";
  externalId: string;

  metadata: {
    url: string;
    date: string;
    tags: string[];
    type: string;
    content: string;
    summary?: string;
  };
}

export interface TumblrBlogInfoResponse {
  meta: {
    status: number;
    msg: string;
  };
  response: {
    blog: {
      name: string;
      title: string;
    };
  };
}
