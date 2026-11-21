package uz.protest.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import uz.protest.app.ui.screens.ExamScreen
import uz.protest.app.ui.screens.LoginScreen
import uz.protest.app.ui.screens.ResultScreen
import uz.protest.app.ui.screens.StudentHomeScreen
import uz.protest.app.ui.theme.ProTestTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ProTestTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()

                    NavHost(navController = navController, startDestination = "login") {
                        composable("login") {
                            LoginScreen(
                                onLoginSuccess = { role ->
                                    navController.navigate("student_home") {
                                        popUpTo("login") { inclusive = true }
                                    }
                                }
                            )
                        }

                        composable("student_home") {
                            StudentHomeScreen(
                                onTestSelected = { testId ->
                                    navController.navigate("exam/$testId")
                                },
                                onLogout = {
                                    navController.navigate("login") {
                                        popUpTo("student_home") { inclusive = true }
                                    }
                                }
                            )
                        }

                        composable(
                            route = "exam/{testId}",
                            arguments = listOf(navArgument("testId") { type = NavType.StringType })
                        ) { backStackEntry ->
                            val testId = backStackEntry.arguments?.getString("testId") ?: ""
                            ExamScreen(
                                testId = testId,
                                onExamFinished = { attemptId ->
                                    navController.navigate("result/$attemptId") {
                                        popUpTo("exam/$testId") { inclusive = true }
                                    }
                                }
                            )
                        }

                        composable(
                            route = "result/{attemptId}",
                            arguments = listOf(navArgument("attemptId") { type = NavType.StringType })
                        ) { backStackEntry ->
                            val attemptId = backStackEntry.arguments?.getString("attemptId") ?: ""
                            ResultScreen(
                                attemptId = attemptId,
                                onBackHome = {
                                    navController.navigate("student_home") {
                                        popUpTo("result/$attemptId") { inclusive = true }
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
