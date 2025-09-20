package com.example.phoneapp.models

data class ChatMessage(
    val id: String,
    val senderId: String,
    val receiverId: String,
    val message: String,
    val timestamp: String,
    val isRead: Boolean = false
)

data class ChatRoom(
    val id: String,
    val participants: List<User>,
    val lastMessage: ChatMessage?,
    val updatedAt: String
)