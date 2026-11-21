package uz.protest.app.data.models

data class User(
    val id: String,
    val phone: String,
    val fullName: String,
    val role: String,
    val email: String? = null
)

data class AuthResponse(
    val success: Boolean,
    val user: User?,
    val accessToken: String?,
    val message: String? = null,
    val isRegistered: Boolean? = null,
    val devOtp: String? = null
)

data class LoginRequest(
    val phone: String,
    val password: String
)

data class OtpRequest(
    val phone: String,
    val code: String? = null
)

data class TestItem(
    val id: String,
    val title: String,
    val description: String?,
    val durationMinutes: Int,
    val allowRetake: Boolean,
    val maxAttempts: Int,
    val teacher: User?
)

data class TestsResponse(
    val success: Boolean,
    val items: List<TestItem>
)

data class Option(
    val id: String,
    val orderLetter: String,
    val text: String,
    val formula: String? = null,
    val imageUrl: String? = null,
    val isCorrect: Boolean? = null
)

data class Question(
    val questionId: String,
    val orderNumber: Int,
    val conditionText: String,
    val conditionFormula: String? = null,
    val conditionImageUrl: String? = null,
    val points: Double,
    val isSingleChoice: Boolean,
    val options: List<Option>
)

data class AttemptStartResponse(
    val success: Boolean,
    val attemptId: String,
    val testId: String,
    val testTitle: String,
    val attemptNumber: Int,
    val totalQuestions: Int,
    val remainingSeconds: Long,
    val questions: List<Question>,
    val savedAnswers: Map<String, SavedAnswerData>?
)

data class SavedAnswerData(
    val selectedOptionIds: List<String>?
)

data class SaveAnswerRequest(
    val questionId: String,
    val selectedOptionIds: List<String>
)

data class AttemptResultResponse(
    val success: Boolean,
    val attempt: AttemptSummary,
    val questionsReview: List<QuestionReview>?
)

data class AttemptSummary(
    val id: String,
    val testTitle: String,
    val attemptNumber: Int,
    val durationSeconds: Int,
    val totalQuestions: Int,
    val correctAnswers: Int,
    val incorrectAnswers: Int,
    val skippedAnswers: Int,
    val score: Double,
    val maxScore: Double,
    val percentage: Double,
    val showExplanations: Boolean
)

data class QuestionReview(
    val questionId: String,
    val orderNumber: Int,
    val conditionText: String,
    val conditionFormula: String?,
    val isCorrect: Boolean,
    val pointsAwarded: Double,
    val points: Double,
    val studentSelectedOptionIds: List<String>?,
    val explanationText: String?,
    val explanationFormula: String?,
    val options: List<OptionReview>
)

data class OptionReview(
    val id: String,
    val orderLetter: String,
    val text: String,
    val formula: String?,
    val isCorrect: Boolean?,
    val isSelected: Boolean
)
