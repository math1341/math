package uz.protest.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import uz.protest.app.ProTestApp
import uz.protest.app.data.api.RetrofitClient
import uz.protest.app.data.local.OfflineAnswer
import uz.protest.app.data.models.AttemptStartResponse
import uz.protest.app.data.models.SaveAnswerRequest
import uz.protest.app.ui.theme.PurplePrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExamScreen(
    testId: String,
    onExamFinished: (attemptId: String) -> Unit
) {
    var attemptData by remember { mutableStateOf<AttemptStartResponse?>(null) }
    var currentIndex by remember { mutableStateOf(0) }
    var answers by remember { mutableStateOf<Map<String, List<String>>>(emptyMap()) }
    var remainingSeconds by remember { mutableStateOf(0L) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val coroutineScope = rememberCoroutineScope()

    // 1. Fetch Attempt
    LaunchedEffect(testId) {
        try {
            val res = RetrofitClient.api.startAttempt(testId)
            if (res.isSuccessful && res.body()?.success == true) {
                val data = res.body()!!
                attemptData = data
                remainingSeconds = data.remainingSeconds

                val restored = mutableMapOf<String, List<String>>()
                data.savedAnswers?.forEach { (k, v) ->
                    v.selectedOptionIds?.let { restored[k] = it }
                }
                answers = restored
            } else {
                errorMessage = "Не удалось начать тестирование"
            }
        } catch (e: Exception) {
            errorMessage = "Ошибка подключения: ${e.message}"
        } finally {
            isLoading = false
        }
    }

    // 2. Timer Loop
    LaunchedEffect(remainingSeconds) {
        if (remainingSeconds > 0) {
            delay(1000)
            remainingSeconds -= 1
        }
    }

    // Timer formatted
    val min = remainingSeconds / 60
    val sec = remainingSeconds % 60
    val timerStr = "%02d:%02d".format(min, sec)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(attemptData?.testTitle ?: "Тестирование", fontSize = 16.sp, fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PurplePrimary,
                    titleContentColor = Color.White
                ),
                actions = {
                    Box(
                        modifier = Modifier
                            .padding(end = 8.dp)
                            .background(Color.White, RoundedCornerShape(8.dp))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = timerStr,
                            color = if (remainingSeconds < 300) Color.Red else PurplePrimary,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 14.sp
                        )
                    }
                }
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFFF8FAFC))
        ) {
            if (isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center), color = PurplePrimary)
            } else if (attemptData != null) {
                val questions = attemptData!!.questions
                val currentQ = questions.getOrNull(currentIndex)

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                ) {
                    // Question Numbers Row
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.padding(bottom = 16.dp)
                    ) {
                        itemsIndexed(questions) { idx, q ->
                            val isSelected = idx == currentIndex
                            val hasAnswer = answers[q.questionId]?.isNotEmpty() == true
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .background(
                                        when {
                                            isSelected -> PurplePrimary
                                            hasAnswer -> Color(0xFFD1FAE5)
                                            else -> Color(0xFFE2E8F0)
                                        },
                                        RoundedCornerShape(10.dp)
                                    )
                                    .clickable { currentIndex = idx },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "${idx + 1}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    color = if (isSelected) Color.White else Color(0xFF1E293B)
                                )
                            }
                        }
                    }

                    // Question Content Card
                    currentQ?.let { q ->
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth(),
                            shape = RoundedCornerShape(20.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(20.dp)
                                    .verticalScroll(rememberScrollState()),
                                verticalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                Text(
                                    text = "Вопрос ${currentIndex + 1} из ${questions.size}",
                                    color = PurplePrimary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp
                                )

                                Text(
                                    text = q.conditionText,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF0F172A)
                                )

                                q.conditionFormula?.let { formula ->
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(Color(0xFFFAF5FF), RoundedCornerShape(12.dp))
                                            .padding(12.dp)
                                    ) {
                                        Text(
                                            text = formula,
                                            fontFamily = FontFamily.Monospace,
                                            fontWeight = FontWeight.SemiBold,
                                            color = PurplePrimary,
                                            fontSize = 14.sp
                                        )
                                    }
                                }

                                // Options List
                                val selectedIds = answers[q.questionId] ?: emptyList()
                                q.options.forEach { opt ->
                                    val isOptSelected = selectedIds.contains(opt.id)
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(
                                                if (isOptSelected) Color(0xFFFAF5FF) else Color(0xFFF8FAFC),
                                                RoundedCornerShape(14.dp)
                                            )
                                            .border(
                                                width = if (isOptSelected) 2.dp else 1.dp,
                                                color = if (isOptSelected) PurplePrimary else Color(0xFFE2E8F0),
                                                shape = RoundedCornerShape(14.dp)
                                            )
                                            .clickable {
                                                val newSelected = listOf(opt.id)
                                                answers = answers + (q.questionId to newSelected)

                                                // 1. Room Offline Storage
                                                coroutineScope.launch {
                                                    ProTestApp.database.offlineAnswerDao().saveAnswer(
                                                        OfflineAnswer(
                                                            attemptId = attemptData!!.attemptId,
                                                            questionId = q.questionId,
                                                            selectedOptionIdsJson = opt.id
                                                        )
                                                    )
                                                    // 2. Server Sync
                                                    try {
                                                        RetrofitClient.api.saveAnswer(
                                                            attemptData!!.attemptId,
                                                            SaveAnswerRequest(q.questionId, newSelected)
                                                        )
                                                    } catch (_: Exception) {}
                                                }
                                            }
                                            .padding(14.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(28.dp)
                                                .background(
                                                    if (isOptSelected) PurplePrimary else Color(0xFFE2E8F0),
                                                    RoundedCornerShape(8.dp)
                                                ),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = opt.orderLetter,
                                                fontWeight = FontWeight.Bold,
                                                color = if (isOptSelected) Color.White else Color.DarkGray,
                                                fontSize = 12.sp
                                            )
                                        }

                                        Text(
                                            text = opt.text.ifEmpty { opt.formula ?: "" },
                                            fontSize = 14.sp,
                                            color = Color(0xFF0F172A),
                                            fontWeight = FontWeight.Medium
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Navigation Bar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        OutlinedButton(
                            onClick = { if (currentIndex > 0) currentIndex -= 1 },
                            enabled = currentIndex > 0
                        ) {
                            Text("Назад")
                        }

                        if (currentIndex < questions.size - 1) {
                            Button(
                                onClick = { currentIndex += 1 },
                                colors = ButtonDefaults.buttonColors(containerColor = PurplePrimary)
                            ) {
                                Text("Далее")
                            }
                        } else {
                            Button(
                                onClick = {
                                    coroutineScope.launch {
                                        try {
                                            val res = RetrofitClient.api.finishAttempt(attemptData!!.attemptId)
                                            if (res.isSuccessful) {
                                                onExamFinished(attemptData!!.attemptId)
                                            }
                                        } catch (_: Exception) {}
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                            ) {
                                Text("Завершить")
                            }
                        }
                    }
                }
            }
        }
    }
}
