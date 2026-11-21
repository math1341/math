package uz.protest.app.data.api

import retrofit2.Response
import retrofit2.http.*
import uz.protest.app.data.models.*

interface ProTestApiService {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/otp/send")
    suspend fun sendOtp(@Body request: OtpRequest): Response<AuthResponse>

    @POST("auth/otp/verify")
    suspend fun verifyOtp(@Body request: OtpRequest): Response<AuthResponse>

    @GET("tests")
    suspend fun getTests(): Response<TestsResponse>

    @POST("testing/{testId}/start")
    suspend fun startAttempt(@Path("testId") testId: string): Response<AttemptStartResponse>

    @POST("testing/attempts/{attemptId}/save-answer")
    suspend fun saveAnswer(
        @Path("attemptId") attemptId: String,
        @Body request: SaveAnswerRequest
    ): Response<Map<String, Any>>

    @POST("testing/attempts/{attemptId}/finish")
    suspend fun finishAttempt(@Path("attemptId") attemptId: String): Response<AttemptResultResponse>

    @GET("testing/attempts/{attemptId}/results")
    suspend fun getResults(@Path("attemptId") attemptId: String): Response<AttemptResultResponse>
}
