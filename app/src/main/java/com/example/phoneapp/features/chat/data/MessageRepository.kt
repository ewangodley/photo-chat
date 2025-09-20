package com.example.phoneapp.features.chat.data

import com.example.phoneapp.core.database.dao.MessageDao
import com.example.phoneapp.core.database.entities.MessageEntity
import com.example.phoneapp.core.api.ChatApiService
import com.example.phoneapp.core.models.Message
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MessageRepository @Inject constructor(
    private val messageDao: MessageDao,
    private val chatApiService: ChatApiService
) {
    
    suspend fun sendMessage(
        recipientId: String,
        roomId: String,
        content: String
    ): Result<Message> {
        return try {
            val response = chatApiService.sendMessage(recipientId, roomId, content)
            
            if (response.success) {
                val messageEntity = MessageEntity(
                    id = response.data.message.id,
                    senderId = response.data.message.senderId ?: "",
                    recipientId = recipientId,
                    roomId = roomId,
                    content = content,
                    status = response.data.message.status,
                    sentAt = response.data.message.sentAt
                )
                messageDao.insertMessage(messageEntity)
                Result.success(response.data.message)
            } else {
                Result.failure(Exception(response.error?.message ?: "Send failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun syncPendingMessages(): Result<List<Message>> {
        return try {
            val response = chatApiService.getPendingMessages()
            
            if (response.success) {
                response.data.messages.forEach { message ->
                    val messageEntity = MessageEntity(
                        id = message.id,
                        senderId = message.senderId,
                        recipientId = "",
                        roomId = message.roomId,
                        content = message.content,
                        status = "delivered",
                        sentAt = message.sentAt
                    )
                    messageDao.insertMessage(messageEntity)
                    
                    // Mark delivered and cleanup from server
                    chatApiService.markMessageDelivered(message.id)
                    chatApiService.cleanupMessage(message.id)
                }
                
                Result.success(response.data.messages)
            } else {
                Result.failure(Exception("Sync failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun getMessagesForRoom(roomId: String): Flow<List<Message>> {
        return messageDao.getMessagesForRoom(roomId).map { entities ->
            entities.map { entity ->
                Message(
                    id = entity.id,
                    senderId = entity.senderId,
                    content = entity.content,
                    sentAt = entity.sentAt
                )
            }
        }
    }
}