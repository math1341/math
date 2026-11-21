package uz.protest.app.data.local

import androidx.room.*

@Entity(tableName = "offline_answers", primaryKeys = ["attemptId", "questionId"])
data class OfflineAnswer(
    val attemptId: String,
    val questionId: String,
    val selectedOptionIdsJson: String,
    val timestamp: Long = System.currentTimeMillis(),
    val isSynced: Boolean = false
)

@Dao
interface OfflineAnswerDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveAnswer(answer: OfflineAnswer)

    @Query("SELECT * FROM offline_answers WHERE attemptId = :attemptId AND isSynced = 0")
    suspend fun getUnsyncedAnswers(attemptId: String): List<OfflineAnswer>

    @Query("UPDATE offline_answers SET isSynced = 1 WHERE attemptId = :attemptId AND questionId = :questionId")
    suspend fun markSynced(attemptId: String, questionId: String)
}

@Database(entities = [OfflineAnswer::class], version = 1, exportSchema = false)
abstract class ProTestDatabase : RoomDatabase() {
    abstract fun offlineAnswerDao(): OfflineAnswerDao

    companion object {
        @Volatile
        private var INSTANCE: ProTestDatabase? = null

        fun getDatabase(context: android.content.Context): ProTestDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    ProTestDatabase::class.java,
                    "protest_local.db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
