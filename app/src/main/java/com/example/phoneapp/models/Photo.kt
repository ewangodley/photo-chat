package com.example.phoneapp.models

data class Photo(
    val id: String,
    val userId: String,
    val imageUrl: String,
    val latitude: Double,
    val longitude: Double,
    val caption: String? = null,
    val createdAt: String,
    val expiresAt: String
)

data class PhotoUploadResponse(
    val photo: Photo
)