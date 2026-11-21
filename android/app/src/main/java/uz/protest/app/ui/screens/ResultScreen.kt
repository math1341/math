package uz.protest.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uz.protest.app.data.api.RetrofitClient
import uz.protest.app.data.models.AttemptSummary
import uz.protest.app.ui.theme.PurplePrimary

@Composable
fun ResultScreen(
    attemptId: String,
    onBackHome: () -> Unit
) {
    var summary by remember { mutableStateOf<AttemptSummary?>(null) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(attemptId) {
        try {
            val res = RetrofitClient.api.getResults(attemptId)
            if (res.isSuccessful && res.body()?.success == true) {
                summary = res.body()!!.attempt
            }
        } catch (_: Exception) {}
        finally {
            isLoading = false
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A)),
        contentAlignment = Alignment.Center
    ) {
        if (isLoading) {
            CircularProgressIndicator(color = PurplePrimary)
        } else if (summary != null) {
            val s = summary!!
            val isPassed = s.percentage >= 60

            Card(
                modifier = Modifier
                    .fillMaxWidth(0.9f)
                    .padding(16.dp),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "Результаты тестирования",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0F172A)
                    )

                    Text(
                        text = s.testTitle,
                        fontSize = 14.sp,
                        color = Color.Gray
                    )

                    // Score Big Circle
                    Text(
                        text = "${s.percentage}%",
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Black,
                        color = if (isPassed) Color(0xFF10B981) else Color(0xFFEF4444)
                    )

                    Text(
                        text = "Баллы: ${s.score} из ${s.maxScore}",
                        fontWeight = FontWeight.Bold,
                        color = PurplePrimary,
                        fontSize = 16.sp
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Верно", fontSize = 11.sp, color = Color.Gray)
                            Text("${s.correctAnswers}", fontWeight = FontWeight.Bold, color = Color(0xFF10B981))
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Неверно", fontSize = 11.sp, color = Color.Gray)
                            Text("${s.incorrectAnswers}", fontWeight = FontWeight.Bold, color = Color(0xFFEF4444))
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Пропущено", fontSize = 11.sp, color = Color.Gray)
                            Text("${s.skippedAnswers}", fontWeight = FontWeight.Bold, color = Color.Gray)
                        }
                    }

                    Button(
                        onClick = onBackHome,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = PurplePrimary),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Вернуться в кабинет", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
