package com.example.phoneapp.api

import com.example.phoneapp.models.*
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    
    // Authentication
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
    
    @POST("auth/logout")
    suspend fun logout(): Response<Unit>
    
    // User Profile
    @GET("user/profile")
    suspend fun getProfile(): Response<User>
    
    @PUT("user/profile")
    suspend fun updateProfile(@Body user: User): Response<User>
    
    // Photos
    @GET("photos")
    suspend fun getPhotos(): Response<List<Photo>>
    
    @Multipart
    @POST("photos/upload")
    suspend fun uploadPhoto(
        @Part image: MultipartBody.Part,
        @Part("latitude") latitude: Double,
        @Part("longitude") longitude: Double,
        @Part("caption") caption: String?
    ): Response<PhotoUploadResponse>
    
    @DELETE("photos/{id}")
    suspend fun deletePhoto(@Path("id") photoId: String): Response<Unit>
    
    // Chat
    @GET("chat/rooms")
    suspend fun getChatRooms(): Response<List<ChatRoom>>
    
    @GET("chat/messages/{roomId}")
    suspend fun getMessages(@Path("roomId") roomId: String): Response<List<ChatMessage>>
    
    @POST("chat/send")
    suspend fun sendMessage(@Body message: ChatMessage): Response<ChatMessage>
}