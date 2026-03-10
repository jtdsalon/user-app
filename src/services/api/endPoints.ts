// User API Endpoints
export const SEARCH_USERS_URL = '/users/search'
export const GET_PROFILE_URL = '/users/profile'
export const UPDATE_PROFILE_URL = '/users/profile'
export const GET_USER_URL = '/users/{userid}'
export const GET_FOLLOWERS_URL = '/users/{userid}/followers'
export const GET_FOLLOWING_URL = '/users/{userid}/following'
export const FOLLOW_USER_URL = '/users/{userid}/follow'
export const UNFOLLOW_USER_URL = '/users/{userid}/follow'
export const ADD_USER_URL = '/users'
export const UPDATE_USER_URL = '/users/{userid}'
export const GET_ALL_USERS_URL = '/users'
export const GET_PAGINATED_USERS_URL = '/users'
export const DELETE_USER_URL = '/users/{userid}'

// Auth endpoints
export const AUTH_SIGNUP_URL = '/auth/register'
export const AUTH_LOGIN_URL = '/auth/login'
export const AUTH_GOOGLE_URL = '/auth/google'
export const AUTH_APPLE_URL = '/auth/apple'
export const GET_SALON_CATEGORIES_URL = '/salons/categories'
export const GET_SALONS_BY_CATEGORY_URL = '/salons/by-category'
export const GET_SALONS_CURSOR_URL = '/salons/cursor'
export const REFRESH_TOKEN_URL = '/auth/refresh'
export const LOGOUT_URL = '/auth/logout'

// Salon API Endpoints
export const GET_SALONS_URL = '/salons'
export const GET_SALON_DETAIL_URL = '/salons/{salonId}'
export const FOLLOW_SALON_URL = '/salons/{salonId}/follow'
export const UNFOLLOW_SALON_URL = '/salons/{salonId}/follow'
export const FOLLOW_PAGE_URL = '/pages/{pageId}/follow'
export const UNFOLLOW_PAGE_URL = '/pages/{pageId}/follow'
export const GET_SALON_SERVICES_URL = '/services/salon/{salonId}'
export const GET_SALON_REVIEWS_URL = '/reviews/salon/{salonId}'
export const SEARCH_SALONS_URL = '/salons/search'

// Artisans (staff/featured specialists)
export const GET_ARTISANS_URL = '/staff/featured'
export const GET_ARTISAN_FILTERS_URL = '/staff/artisan-filters'
export const GET_STAFF_BY_SALON_URL = '/staff/salon/{salonId}'
export const GET_STAFF_AVAILABILITY_URL = '/staff/{staffId}/availability'

// Branches
export const GET_BRANCHES_BY_SALON_URL = '/branches/salon/{salonId}'

// Promotions (user-app)
export const VALIDATE_PROMO_CODE_URL = '/promotions/validate-code'
export const RECORD_PROMOTION_VIEW_URL = '/promotions/{id}/view'

// Booking
export const GET_BOOKING_CONTEXT_URL = '/bookings/context'
export const GET_MY_BOOKINGS_URL = '/bookings/my-bookings'
export const CREATE_BOOKING_URL = '/bookings'
export const UPLOAD_STYLE_IMAGE_URL = '/bookings/upload-style-image'

// Vacancies / Jobs
export const GET_VACANCIES_URL = '/vacancies'
export const GET_VACANCIES_BY_SALON_URL = '/vacancies/salon/{salonId}'
export const SUBMIT_VACANCY_APPLICATION_URL = '/vacancies/{vacancyId}/applications'

// Feed / Posts
export const GET_POSTS_URL = '/posts'
export const GET_FAVOURITES_FEED_URL = '/posts/favourites'
export const GET_PUBLIC_FEED_URL = '/posts/public'
export const GET_SAVED_FEED_URL = '/posts/saved'
export const GET_POST_URL = '/posts/{postId}'
export const CREATE_POST_URL = '/posts'
export const UPDATE_POST_URL = '/posts/{postId}'
export const DELETE_POST_URL = '/posts/{postId}'
export const UPLOAD_POST_IMAGE_URL = '/posts/upload-image'
export const TOGGLE_POST_LIKE_URL = '/posts/{postId}/like'
export const TOGGLE_POST_SAVE_URL = '/posts/{postId}/save'
export const GET_POST_LIKERS_URL = '/posts/{postId}/likers'
export const ADD_POST_COMMENT_URL = '/posts/{postId}/comments'
export const UPDATE_POST_COMMENT_URL = '/posts/{postId}/comments/{commentId}'
export const DELETE_POST_COMMENT_URL = '/posts/{postId}/comments/{commentId}'
export const TOGGLE_POST_COMMENT_LIKE_URL = '/posts/{postId}/comments/{commentId}/like'
export const GET_POST_COMMENT_LIKERS_URL = '/posts/{postId}/comments/{commentId}/likers'

// Stories
export const GET_STORIES_URL = '/stories'
export const GET_STORY_URL = '/stories/{storyId}'
export const CREATE_STORY_URL = '/stories'
export const DELETE_STORY_URL = '/stories/{storyId}'
export const UPLOAD_STORY_IMAGE_URL = '/stories/upload-image'

// Notifications
export const GET_NOTIFICATIONS_URL = '/notifications'
export const GET_NOTIFICATIONS_UNREAD_COUNT_URL = '/notifications/unread-count'
export const MARK_NOTIFICATION_READ_URL = '/notifications/{id}/read'
export const MARK_ALL_NOTIFICATIONS_READ_URL = '/notifications/read-all'
export const DELETE_NOTIFICATION_URL = '/notifications/{id}'
export const CLEAR_ALL_NOTIFICATIONS_URL = '/notifications'
