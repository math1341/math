import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const MATH_TOPICS = [
  // 1. Арифметика и теория чисел (Parent)
  {
    name: 'Арифметика и теория чисел',
    description: 'Основы чисел, делимость, дроби и процентные вычисления',
    orderIndex: 1,
    children: [
      { name: 'Натуральные числа и нуль', description: 'Свойства натурального ряда' },
      { name: 'Простые и составные числа', description: 'Разложение на простые множители' },
      { name: 'Признаки делимости', description: 'Делимость на 2, 3, 4, 5, 9, 10, 11' },
      { name: 'Наибольший общий делитель (НОД)', description: 'Алгоритм Евклида' },
      { name: 'Наименьшее общее кратное (НОК)', description: 'Вычисление НОК' },
      { name: 'Деление с остатком', description: 'Теорема о делении с остатком' },
      { name: 'Целые числа и модуль числа', description: 'Абсолютная величина и операции' },
      { name: 'Обыкновенные дроби', description: 'Правильные и неправильные дроби' },
      { name: 'Арифметические действия с дробями', description: 'Сложение, вычитание, умножение, деление дробей' },
      { name: 'Десятичные дроби', description: 'Конечные и периодические дроби' },
      { name: 'Перевод дробей', description: 'Преобразование периодической дроби в обыкновенную' },
      { name: 'Пропорции и отношения', description: 'Основное свойство пропорции' },
      { name: 'Проценты', description: 'Нахождение процента от числа и числа по его проценту' },
      { name: 'Сложные проценты', description: 'Формула сложных процентов' },
      { name: 'Системы счисления', description: 'Двоичная, восьмеричная, шестнадцатеричная системы' },
      { name: 'Числовые последовательности', description: 'Закономерности и формулы n-го члена' },
      { name: 'Арифметическая прогрессия', description: 'Разность, n-й член и сумма n первых членов' },
      { name: 'Геометрическая прогрессия', description: 'Знаменатель, n-й член и сумма прогрессии' },
      { name: 'Бесконечно убывающая геометрическая прогрессия', description: 'Сумма бесконечной прогрессии' },
      { name: 'Диофантовы уравнения первой степени', description: 'Уравнения в целых числах' },
    ],
  },

  // 2. Алгебра и элементарные преобразования
  {
    name: 'Алгебра и многочлены',
    description: 'Одночлены, многочлены, степени и радикалы',
    orderIndex: 2,
    children: [
      { name: 'Степень с натуральным показателем', description: 'Свойства умножения и деления степеней' },
      { name: 'Степень с целым показателем', description: 'Отрицательные степени' },
      { name: 'Арифметический квадратный корень', description: 'Свойства радикалов' },
      { name: 'Корень n-й степени', description: 'Свойства корней произвольной степени' },
      { name: 'Степень с рациональным показателем', description: 'Дробные показатели' },
      { name: 'Одночлены и многочлены', description: 'Приведение подобных слагаемых' },
      { name: 'Формулы сокращенного умножения', description: 'Квадрат суммы, разность квадратов, кубы' },
      { name: 'Разложение на множители', description: 'Вынесение общего множителя, способ группировки' },
      { name: 'Алгебраические дроби', description: 'Сокращение и преобразование дробей' },
      { name: 'Деление многочлена на многочлен углом', description: 'Теорема Безу' },
      { name: 'Схема Горнера', description: 'Быстрое деление многочленов' },
      { name: 'Освобождение от иррациональности в знаменателе', description: 'Сопряженные выражения' },
    ],
  },

  // 3. Уравнения и системы уравнений
  {
    name: 'Уравнения и системы уравнений',
    description: 'Все типы алгебраических и трансцендентных уравнений',
    orderIndex: 3,
    children: [
      { name: 'Линейные уравнения с одной переменной', description: 'ax + b = 0' },
      { name: 'Квадратные уравнения', description: 'Дискриминант и формула корней' },
      { name: 'Теорема Виета', description: 'Связь корней и коэффициентов' },
      { name: 'Биквадратные уравнения', description: 'Метод замены переменной' },
      { name: 'Дробно-рациональные уравнения', description: 'ОДЗ и посторонние корни' },
      { name: 'Иррациональные уравнения', description: 'Возведение в степень и проверка ОДЗ' },
      { name: 'Уравнения с модулем', description: 'Раскрытие модуля по промежуткам' },
      { name: 'Показательные уравнения', description: 'Приведение к одинаковому основанию' },
      { name: 'Логарифмические уравнения', description: 'Потенцирование и ОДЗ логарифма' },
      { name: 'Однородные тригонометрические уравнения', description: 'Деление на cos(x) или sin(x)' },
      { name: 'Системы линейных уравнений', description: 'Метод подстановки, сложения, метод Крамера' },
      { name: 'Системы нелинейных уравнений', description: 'Симметричные системы и замена переменных' },
      { name: 'Уравнения высших степеней', description: 'Возвратные уравнения и замена переменных' },
      { name: 'Уравнения с параметрами: линейные', description: 'Исследование количества корней от параметра' },
      { name: 'Уравнения с параметрами: квадратные', description: 'Расположение корней квадратного трехчлена' },
    ],
  },

  // 4. Неравенства
  {
    name: 'Неравенства и системы неравенств',
    description: 'Методы решения числовых и функциональных неравенств',
    orderIndex: 4,
    children: [
      { name: 'Числовые неравенства и их свойства', description: 'Сложение, умножение, транзитивность' },
      { name: 'Линейные неравенства с одной переменной', description: 'Интервалы на числовой прямой' },
      { name: 'Квадратные неравенства', description: 'Параболический метод' },
      { name: 'Метод интервалов', description: 'Чередование знаков рациональных функций' },
      { name: 'Дробно-рациональные неравенства', description: 'Строгие и нестрогие неравенства' },
      { name: 'Неравенства с модулем', description: '|x| < a и |x| > a' },
      { name: 'Иррациональные неравенства', description: 'Системы равносильных переходов' },
      { name: 'Показательные неравенства', description: 'Монотонность показательной функции' },
      { name: 'Логарифмические неравенства', description: 'Переход к основанию больше 1 или меньше 1' },
      { name: 'Метод рационализации (метод декомпозиции)', description: 'Замена разности логарифмов и степеней' },
      { name: 'Системы и совокупности неравенств', description: 'Пересечение и объединение множеств решений' },
      { name: 'Неравенство Коши (о среднем арифметическом и геометрическом)', description: 'a + b >= 2*sqrt(ab)' },
      { name: 'Неравенства с параметром', description: 'Графический и аналитический методы' },
    ],
  },

  // 5. Функции и их графики
  {
    name: 'Функции и их графики',
    description: 'Исследование функций, свойства и преобразования графиков',
    orderIndex: 5,
    children: [
      { name: 'Понятие функции, область определения и область значений', description: 'D(f) и E(f)' },
      { name: 'Способы задания функций', description: 'Аналитический, табличный, графический' },
      { name: 'Четность и нечетность функций', description: 'Симметрия относительно оси OY и начала координат' },
      { name: 'Периодичность функций', description: 'Основной период функции' },
      { name: 'Монотонность функций', description: 'Возрастание и убывание' },
      { name: 'Ограниченность и экстремумы', description: 'Локальные и глобальные максимумы и минимумы' },
      { name: 'Линейная функция y = kx + b', description: 'Угловой коэффициент и геометрический смысл' },
      { name: 'Квадратичная функция y = ax^2 + bx + c', description: 'Вершина параболы, направление ветвей' },
      { name: 'Обратная пропорциональность y = k/x', description: 'Гипербола и асимптоты' },
      { name: 'Степенная функция y = x^a', description: 'Графики при различных показателях' },
      { name: 'Показательная функция y = a^x', description: 'Экспонента и основания a > 1, 0 < a < 1' },
      { name: 'Логарифмическая функция y = log_a(x)', description: 'Натуральный и десятичный логарифмы' },
      { name: 'Обратная функция', description: 'Условие обратимости и симметрия относительно y = x' },
      { name: 'Геометрические преобразования графиков', description: 'Параллельный перенос, сжатие, растяжение, отражение' },
      { name: 'Построение графиков с модулями', description: 'f(|x|) и |f(x)|' },
    ],
  },

  // 6. Тригонометрия
  {
    name: 'Тригонометрия',
    description: 'Тригонометрические функции, тождества и формулы',
    orderIndex: 6,
    children: [
      { name: 'Радианная мера угла', description: 'Связь градусов и радиан' },
      { name: 'Единичная тригонометрическая окружность', description: 'Определение синуса, косинуса, тангенса, котангенса' },
      { name: 'Знаки тригонометрических функций по четвертям', description: 'Таблица основных значений' },
      { name: 'Основное тригонометрическое тождество', description: 'sin^2(x) + cos^2(x) = 1' },
      { name: 'Формулы приведения', description: 'Правило изменения функции на кофункцию' },
      { name: 'Формулы сложения аргументов', description: 'sin(x+y), cos(x+y), tg(x+y)' },
      { name: 'Формулы двойного и тройного угла', description: 'sin(2x), cos(2x), sin(3x)' },
      { name: 'Формулы половинного угла и понижения степени', description: 'sin^2(x) = (1 - cos(2x))/2' },
      { name: 'Преобразование суммы в произведение', description: 'sin(x) + sin(y) и cos(x) + cos(y)' },
      { name: 'Преобразование произведения в сумму', description: 'sin(x)*cos(y) и cos(x)*cos(y)' },
      { name: 'Универсальная тригонометрическая подстановка', description: 'Выражение через tg(x/2)' },
      { name: 'Обратные тригонометрические функции', description: 'arcsin, arccos, arctg, arcctg' },
      { name: 'Простейшие тригонометрические уравнения', description: 'Частные случаи и общие формулы корней' },
      { name: 'Тригонометрические неравенства', description: 'Решение с помощью числовой окружности' },
    ],
  },

  // 7. Начала математического анализа
  {
    name: 'Математический анализ',
    description: 'Пределы, производная, интеграл и их приложения',
    orderIndex: 7,
    children: [
      { name: 'Предел числовой последовательности', description: 'Свойства пределов и число e' },
      { name: 'Предел функции в точке и на бесконечности', description: 'Замечательные пределы' },
      { name: 'Непрерывность функции', description: 'Точки разрыва первого и второго рода' },
      { name: 'Понятие производной', description: 'Приращение функции и геометрический смысл' },
      { name: 'Физический смысл производной', description: 'Мгновенная скорость и ускорение' },
      { name: 'Таблица производных элементарных функций', description: 'Производные степенных, тригонометрических и др.' },
      { name: 'Правила дифференцирования', description: 'Производная суммы, произведения, частного' },
      { name: 'Производная сложной функции', description: 'Цепное правило дифференцирования' },
      { name: 'Уравнение касательной к графику функции', description: 'y = f(x0) + f\'(x0)(x - x0)' },
      { name: 'Применение производной к исследованию функций', description: 'Промежутки возрастания и убывания' },
      { name: 'Критические точки и точки экстремума', description: 'Достаточные условия экстремума' },
      { name: 'Наибольшее и наименьшее значения на отрезке', description: 'Алгоритм нахождения глобального экстремума' },
      { name: 'Выпуклость графика и точки перегиба', description: 'Вторая производная' },
      { name: 'Первообразная и ее основное свойство', description: 'Семейство первообразных F(x) + C' },
      { name: 'Неопределенный интеграл', description: 'Таблица основных интегралов' },
      { name: 'Определенный интеграл', description: 'Формула Ньютона-Лейбница' },
      { name: 'Геометрический смысл определенного интеграла', description: 'Вычисление площади криволинейной трапеции' },
      { name: 'Вычисление объемов тел вращения с помощью интеграла', description: 'V = pi * int(y^2 dx)' },
    ],
  },

  // 8. Планиметрия (Геометрия на плоскости)
  {
    name: 'Планиметрия',
    description: 'Фигуры на плоскости, их свойства, углы, длины и площади',
    orderIndex: 8,
    children: [
      { name: 'Основные понятия геометрии', description: 'Точка, прямая, луч, отрезок, угол' },
      { name: 'Смежные и вертикальные углы', description: 'Свойства пересекающихся прямых' },
      { name: 'Параллельные прямые', description: 'Накрест лежащие, соответственные и односторонние углы' },
      { name: 'Треугольник: основные элементы и сумма углов', description: 'Сумма углов равна 180 градусам' },
      { name: 'Признаки равенства треугольников', description: 'Три признака конгруэнтности' },
      { name: 'Равнобедренный и равносторонний треугольники', description: 'Свойства медианы, высоты, биссектрисы' },
      { name: 'Прямоугольный треугольник', description: 'Теорема Пифагора и метрические соотношения' },
      { name: 'Теорема синусов', description: 'Отношение сторон к синусам противолежащих углов' },
      { name: 'Теорема косинусов', description: 'Обобщение теоремы Пифагора' },
      { name: 'Подобие треугольников', description: 'Признаки подобия и отношение площадей' },
      { name: 'Замечательные точки треугольника', description: 'Ортоцентр, центроид, инцентр, циркумцентр' },
      { name: 'Формулы площади треугольника', description: 'Через основание и высоту, формулы Герона, через радиусы' },
      { name: 'Параллелограмм и его свойства', description: 'Противолежащие стороны, углы, диагонали' },
      { name: 'Прямоугольник, ромб, квадрат', description: 'Частные виды параллелограммов и их площади' },
      { name: 'Трапеция: свойства и средняя линия', description: 'Равнобедренная и прямоугольная трапеции' },
      { name: 'Окружность и круг', description: 'Радиус, диаметр, хорда, дуга, сектор, сегмент' },
      { name: 'Касательная и секущая к окружности', description: 'Теорема о касательной и секущей' },
      { name: 'Центральные и вписанные углы', description: 'Угол, опирающийся на диаметр' },
      { name: 'Вписанные и описанные окружности', description: 'Условия вписанности и описанности многоугольников' },
      { name: 'Правильные многоугольники', description: 'Формулы углов, радиусов и площадей' },
      { name: 'Векторы на плоскости', description: 'Координаты, длина, коллинеарность, скалярное произведение' },
      { name: 'Метод координат на плоскости', description: 'Расстояние между точками, деление отрезка в отношении' },
    ],
  },

  // 9. Стереометрия (Геометрия в пространстве)
  {
    name: 'Стереометрия',
    description: 'Пространственные тела, многогранники, тела вращения и объемы',
    orderIndex: 9,
    children: [
      { name: 'Аксиомы стереометрии и их следствия', description: 'Плоскости в пространстве' },
      { name: 'Взаимное расположение прямых и плоскостей', description: 'Скрещивающиеся прямые' },
      { name: 'Параллельность в пространстве', description: 'Признаки параллельности прямых и плоскостей' },
      { name: 'Перпендикулярность прямой и плоскости', description: 'Признак перпендикулярности' },
      { name: 'Теорема о трех перпендикулярах', description: 'Проекция на плоскость' },
      { name: 'Угол между прямой и плоскостью', description: 'Ортонормированная проекция' },
      { name: 'Двугранный угол и угол между плоскостями', description: 'Линейный угол двугранного угла' },
      { name: 'Призма: прямая и наклонная', description: 'Основания, боковые ребра, площадь поверхности' },
      { name: 'Параллелепипед и куб', description: 'Диагональ прямоугольного параллелепипеда, объем' },
      { name: 'Пирамида: правильная и усеченная', description: 'Апофема, боковые грани, высота' },
      { name: 'Правильные многогранники (Платоновы тела)', description: 'Тетраэдр, гексаэдр, октаэдр, додекаэдр, икосаэдр' },
      { name: 'Цилиндр', description: 'Образующая, осевое сечение, площадь и объем' },
      { name: 'Конус и усеченный конус', description: 'Высота, образующая, развертка, площадь и объем' },
      { name: 'Шар и сфера', description: 'Сечение шара плоскостью, площадь сферы, объем шара' },
      { name: 'Комбинации многогранников и тел вращения', description: 'Вписанные и описанные сферы' },
      { name: 'Векторы и координаты в пространстве', description: 'Координаты вектора, скалярное произведение, угол' },
      { name: 'Уравнение плоскости и сферы в пространстве', description: 'Нормальный вектор плоскости' },
    ],
  },

  // 10. Комбинаторика, теория вероятностей и математическая статистика
  {
    name: 'Комбинаторика, теория вероятностей и статистика',
    description: 'Подсчет вариантов, случайные события, распределения и выборки',
    orderIndex: 10,
    children: [
      { name: 'Правило сложения и умножения вариантов', description: 'Комбинаторные принципы' },
      { name: 'Факториал и его свойства', description: 'n! и формула Стирлинга' },
      { name: 'Перестановки без повторений и с повторениями', description: 'P_n = n!' },
      { name: 'Размещения без повторений и с повторениями', description: 'A_n^k' },
      { name: 'Сочетания без повторений и с повторениями', description: 'C_n^k и треугольник Паскаля' },
      { name: 'Бином Ньютона', description: 'Коэффициенты и формула разложения' },
      { name: 'Классическое определение вероятности', description: 'P(A) = m/n' },
      { name: 'Геометрическая вероятность', description: 'Вероятность попадания в область' },
      { name: 'Совместные и несовместные события', description: 'Теорема сложения вероятностей' },
      { name: 'Зависимые и независимые события', description: 'Условная вероятность и теорема умножения' },
      { name: 'Формула полной вероятности и формула Байеса', description: 'Априорные и апостериорные вероятности' },
      { name: 'Схема Бернулли', description: 'Биномиальное распределение вероятностей' },
      { name: 'Дискретная случайная величина', description: 'Закон распределения' },
      { name: 'Математическое ожидание и дисперсия', description: 'Характеристики центра и разброса' },
      { name: 'Элементы математической статистики', description: 'Выборка, генеральная совокупность' },
      { name: 'Статистические характеристики', description: 'Среднее арифметическое, мода, медиана, размах' },
      { name: 'Графическое представление данных', description: 'Гистограммы, полигоны частот, круговые диаграммы' },
    ],
  },

  // 11. Текстовые и прикладные математические задачи
  {
    name: 'Текстовые и прикладные математические задачи',
    description: 'Моделирование реальных процессов, движение, работа, экономика',
    orderIndex: 11,
    children: [
      { name: 'Задачи на движение по прямой', description: 'Скорость сближения и удаления' },
      { name: 'Задачи на движение по реке (по течению и против течения)', description: 'Собственная скорость и скорость течения' },
      { name: 'Задачи на движение по окружности и замкнутой трассе', description: 'Периодичность встреч' },
      { name: 'Задачи на совместную работу', description: 'Производительность и объем работы' },
      { name: 'Задачи на бассейны и трубы', description: 'Наполнение и опорожнение резервуаров' },
      { name: 'Задачи на сплавы, растворы и смеси', description: 'Концентрация и массовая доля' },
      { name: 'Экономические задачи: простые и сложные проценты', description: 'Банковские вклады' },
      { name: 'Экономические задачи: кредиты с дифференцированными платежами', description: 'Убывающий долг' },
      { name: 'Экономические задачи: аннуитетные платежи', description: 'Равные ежемесячные выплаты' },
      { name: 'Задачи на оптимизацию', description: 'Наибольшая прибыль и наименьшие издержки' },
      { name: 'Задачи на числа и их разрядный состав', description: 'Двузначные и трехзначные числа' },
    ],
  },
];

export async function seedDatabase() {
  console.log('Seeding ProTest database...');

  // 1. Seed Users (Admin, Teacher, Student)
  const passwordHash = await bcrypt.hash('ProTest2026!', 10);

  const admin = await prisma.user.upsert({
    where: { phone: '+998901234567' },
    update: {},
    create: {
      phone: '+998901234567',
      email: 'admin@protest.uz',
      passwordHash,
      fullName: 'Администратор Системы',
      role: 'ADMIN',
      isBlocked: false,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { phone: '+998902345678' },
    update: {},
    create: {
      phone: '+998902345678',
      email: 'teacher@protest.uz',
      passwordHash,
      fullName: 'Каримов Алишер Рустамович',
      role: 'TEACHER',
      isBlocked: false,
    },
  });

  const student = await prisma.user.upsert({
    where: { phone: '+998903456789' },
    update: {},
    create: {
      phone: '+998903456789',
      email: 'student@protest.uz',
      passwordHash,
      fullName: 'Умаров Жасурбек Ботирович',
      role: 'STUDENT',
      isBlocked: false,
    },
  });

  console.log('Users seeded: Admin, Teacher, Student');

  // 2. Seed Group and GroupMember
  const group = await prisma.group.upsert({
    where: { id: 'demo-math-group-1' },
    update: {},
    create: {
      id: 'demo-math-group-1',
      name: 'Группа МАТ-101 (Профильная математика)',
      description: 'Ученики 10-11 классов для подготовки к олимпиадам и тестированию',
      teacherId: teacher.id,
    },
  });

  await prisma.groupMember.upsert({
    where: {
      groupId_studentId: {
        groupId: group.id,
        studentId: student.id,
      },
    },
    update: {},
    create: {
      groupId: group.id,
      studentId: student.id,
    },
  });

  console.log('Group seeded with student membership');

  // 3. Seed 150+ Math Topics
  let totalTopics = 0;
  let firstSubtopicId = '';

  for (const parentCategory of MATH_TOPICS) {
    const parent = await prisma.topic.create({
      data: {
        name: parentCategory.name,
        description: parentCategory.description,
        orderIndex: parentCategory.orderIndex,
      },
    });
    totalTopics++;

    let childIndex = 1;
    for (const child of parentCategory.children) {
      const createdChild = await prisma.topic.create({
        data: {
          name: child.name,
          description: child.description,
          parentId: parent.id,
          orderIndex: childIndex++,
        },
      });
      totalTopics++;
      if (!firstSubtopicId) {
        firstSubtopicId = createdChild.id;
      }
    }
  }

  console.log(`Seeded ${totalTopics} hierarchical math topics (well above required 150)!`);

  // 4. Seed Comprehensive Math Questions with KaTeX formulas
  const sampleTopic = await prisma.topic.findFirst({
    where: { name: { contains: 'Квадратные уравнения' } },
  }) || { id: firstSubtopicId };

  const calcTopic = await prisma.topic.findFirst({
    where: { name: { contains: 'Определенный интеграл' } },
  }) || { id: firstSubtopicId };

  const geomTopic = await prisma.topic.findFirst({
    where: { name: { contains: 'Теорема Пифагора' } },
  }) || { id: firstSubtopicId };

  // Question 1: Quadratic equation with KaTeX
  const q1 = await prisma.question.create({
    data: {
      topicId: sampleTopic.id,
      authorId: teacher.id,
      conditionText: 'Найдите корни квадратного уравнения:',
      conditionFormula: '2x^2 - 5x + 2 = 0',
      difficulty: 'MEDIUM',
      points: 2.0,
      isSingleChoice: true,
      explanationText: 'Используем формулу дискриминанта:',
      explanationFormula: 'D = b^2 - 4ac = (-5)^2 - 4 \\cdot 2 \\cdot 2 = 25 - 16 = 9 = 3^2 \\implies x_{1,2} = \\frac{5 \\pm 3}{4}',
      options: {
        create: [
          { text: 'x_1 = 2, \\quad x_2 = \\frac{1}{2}', formula: 'x_1 = 2,\\ x_2 = 0.5', isCorrect: true, orderIndex: 1 },
          { text: 'x_1 = -2, \\quad x_2 = -\\frac{1}{2}', formula: 'x_1 = -2,\\ x_2 = -0.5', isCorrect: false, orderIndex: 2 },
          { text: 'x_1 = 1, \\quad x_2 = 4', formula: 'x_1 = 1,\\ x_2 = 4', isCorrect: false, orderIndex: 3 },
          { text: 'x_1 = 3, \\quad x_2 = -1', formula: 'x_1 = 3,\\ x_2 = -1', isCorrect: false, orderIndex: 4 },
        ],
      },
    },
    include: { options: true },
  });

  // Question 2: Definite Integral
  const q2 = await prisma.question.create({
    data: {
      topicId: calcTopic.id,
      authorId: teacher.id,
      conditionText: 'Вычислите определенный интеграл:',
      conditionFormula: '\\int_{0}^{2} (3x^2 - 2x + 1)\\, dx',
      difficulty: 'HARD',
      points: 3.0,
      isSingleChoice: true,
      explanationText: 'По формуле Ньютона-Лейбница:',
      explanationFormula: 'F(x) = x^3 - x^2 + x \\implies F(2) - F(0) = (8 - 4 + 2) - 0 = 6',
      options: {
        create: [
          { text: '6', formula: '6', isCorrect: true, orderIndex: 1 },
          { text: '8', formula: '8', isCorrect: false, orderIndex: 2 },
          { text: '4', formula: '4', isCorrect: false, orderIndex: 3 },
          { text: '10', formula: '10', isCorrect: false, orderIndex: 4 },
        ],
      },
    },
    include: { options: true },
  });

  // Question 3: Trigonometry / Geometry
  const q3 = await prisma.question.create({
    data: {
      topicId: geomTopic.id,
      authorId: teacher.id,
      conditionText: 'В прямоугольном треугольнике катеты равны a = 6 и b = 8. Найдите гипотенузу c и радиус описанной окружности R:',
      conditionFormula: 'c = \\sqrt{a^2 + b^2},\\quad R = \\frac{c}{2}',
      difficulty: 'EASY',
      points: 1.5,
      isSingleChoice: true,
      explanationText: 'По теореме Пифагора c = 10, радиус описанной окружности прямоугольного треугольника равен половине гипотенузы, то есть R = 5.',
      explanationFormula: 'c = \\sqrt{36 + 64} = 10,\\quad R = 5',
      options: {
        create: [
          { text: 'c = 10,\\quad R = 5', formula: 'c=10, R=5', isCorrect: true, orderIndex: 1 },
          { text: 'c = 14,\\quad R = 7', formula: 'c=14, R=7', isCorrect: false, orderIndex: 2 },
          { text: 'c = 12,\\quad R = 6', formula: 'c=12, R=6', isCorrect: false, orderIndex: 3 },
          { text: 'c = 10,\\quad R = 10', formula: 'c=10, R=10', isCorrect: false, orderIndex: 4 },
        ],
      },
    },
    include: { options: true },
  });

  // 5. Create a Demo Test
  const test = await prisma.test.create({
    data: {
      title: 'Входной диагностический тест по математике',
      description: 'Проверка знаний по алгебре, тригонометрии и началам анализа',
      teacherId: teacher.id,
      durationMinutes: 45,
      shuffleQuestions: true,
      shuffleOptions: true,
      allowRetake: true,
      maxAttempts: 3,
      showResultsImmediately: true,
      showExplanations: true,
      assignedGroups: {
        create: [
          { groupId: group.id },
        ],
      },
      testQuestions: {
        create: [
          { questionId: q1.id, orderIndex: 1, points: 2.0 },
          { questionId: q2.id, orderIndex: 2, points: 3.0 },
          { questionId: q3.id, orderIndex: 3, points: 1.5 },
        ],
      },
    },
  });

  console.log(`Demo test created with ID: ${test.id}`);
  console.log('Seeding completed successfully!');
}

if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
