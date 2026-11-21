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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import uz.protest.app.data.api.RetrofitClient
import uz.protest.app.data.models.LoginRequest
import uz.protest.app.data.models.OtpRequest
import uz.protest.app.ui.theme.PurplePrimary

@Composable
fun LoginScreen(
    onLoginSuccess: (role: String) -> Unit
) {
    var isOtpMode by remember { mutableStateOf(false) }
    var phone by remember { mutableStateOf("+998903456789") }
    var password by remember { mutableStateOf("ProTest2026!") }
    var otpCode by remember { mutableStateOf("") }
    var otpSent by remember { mutableStateOf(false) }

    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    val coroutineScope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A)),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.9f)
                .padding(16.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Logo Icon
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .background(PurplePrimary, shape = RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("P", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black)
                }

                Text(
                    text = "ProTest Math",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0F172A)
                )

                Text(
                    text = "Мобильное тестирование по математике",
                    fontSize = 12.sp,
                    color = Color.Gray
                )

                // Mode switch
                Row(modifier = Modifier.fillMaxWidth()) {
                    Button(
                        onClick = { isOtpMode = false },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (!isOtpMode) PurplePrimary else Color(0xFFE2E8F0),
                            contentColor = if (!isOtpMode) Color.White else Color.DarkGray
                        ),
                        shape = RoundedCornerShape(topStart = 12.dp, bottomStart = 12.dp)
                    ) {
                        Text("Пароль", fontSize = 12.sp)
                    }
                    Button(
                        onClick = { isOtpMode = true },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isOtpMode) PurplePrimary else Color(0xFFE2E8F0),
                            contentColor = if (isOtpMode) Color.White else Color.DarkGray
                        ),
                        shape = RoundedCornerShape(topEnd = 12.dp, bottomEnd = 12.dp)
                    ) {
                        Text("SMS OTP (+998)", fontSize = 12.sp)
                    }
                }

                errorMessage?.let {
                    Text(it, color = Color.Red, fontSize = 12.sp)
                }

                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Номер телефона") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                if (!isOtpMode) {
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Пароль") },
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )

                    Button(
                        onClick = {
                            coroutineScope.launch {
                                isLoading = true
                                errorMessage = null
                                try {
                                    val res = RetrofitClient.api.login(LoginRequest(phone, password))
                                    if (res.isSuccessful && res.body()?.success == true) {
                                        val body = res.body()!!
                                        RetrofitClient.authToken = body.accessToken
                                        onLoginSuccess(body.user?.role ?: "STUDENT")
                                    } else {
                                        errorMessage = res.body()?.message ?: "Ошибка авторизации"
                                    }
                                } catch (e: Exception) {
                                    errorMessage = "Ошибка подключения к серверу: ${e.message}"
                                } finally {
                                    isLoading = false
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PurplePrimary),
                        shape = RoundedCornerShape(14.dp),
                        enabled = !isLoading
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                        } else {
                            Text("Войти", fontWeight = FontWeight.Bold)
                        }
                    }
                } else {
                    if (otpSent) {
                        OutlinedTextField(
                            value = otpCode,
                            onValueChange = { if (it.length <= 6) otpCode = it },
                            label = { Text("6-значный код") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }

                    Button(
                        onClick = {
                            coroutineScope.launch {
                                isLoading = true
                                errorMessage = null
                                try {
                                    if (!otpSent) {
                                        val res = RetrofitClient.api.sendOtp(OtpRequest(phone))
                                        if (res.isSuccessful && res.body()?.success == true) {
                                            otpSent = true
                                            if (res.body()?.devOtp != null) {
                                                otpCode = res.body()!!.devOtp!!
                                            }
                                        } else {
                                            errorMessage = res.body()?.message ?: "Не удалось отправить код"
                                        }
                                    } else {
                                        val res = RetrofitClient.api.verifyOtp(OtpRequest(phone, otpCode))
                                        if (res.isSuccessful && res.body()?.success == true) {
                                            val body = res.body()!!
                                            RetrofitClient.authToken = body.accessToken
                                            onLoginSuccess(body.user?.role ?: "STUDENT")
                                        } else {
                                            errorMessage = res.body()?.message ?: "Неверный код"
                                        }
                                    }
                                } catch (e: Exception) {
                                    errorMessage = "Ошибка: ${e.message}"
                                } finally {
                                    isLoading = false
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PurplePrimary),
                        shape = RoundedCornerShape(14.dp),
                        enabled = !isLoading
                    ) {
                        Text(if (!otpSent) "Запросить код" else "Подтвердить код", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
