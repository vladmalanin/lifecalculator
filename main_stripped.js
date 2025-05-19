// Функція отримання очікуваної тривалості життя
function getLifeExpectancy(personalLifeTable) {
  // Якщо персональні дані відсутні, повертаємо середню тривалість життя
  if (!personalLifeTable) return averageLifeDuration;
  // Повертаємо вік, при якому шанс виживання стає менше 60%
  for (let index = 0; index < personalLifeTable.length; index++) {
    if (personalLifeTable[index].chance <= 60000) return personalLifeTable[index].age;
  }
}

// Розрахунок персональної таблиці тривалості життя
function calculatePersonalLifeTable() {
  // Створюємо копію базової таблиці тривалості життя залежно від статі користувача
  personalLifeTable = generalLifeTable[answers.gender];

  // Визначаємо коефіцієнт на основі індексу маси тіла (BMI)
  let bmiCoefficient = 1;
  if (answers.weight && answers.height) {
    const height = parseInt(answers.height) / 100;
    const weight = parseInt(answers.weight);
    const bmi = weight / (height * height);
    if (bmi && !isNaN(bmi)) {
      if (bmi >= 18.5 && bmi <= 25) bmiCoefficient = 0.5;
      else if (bmi >= 16 && bmi <= 18.5) bmiCoefficient = 0.75;
      else if (bmi < 16) bmiCoefficient = 1;
      else if (bmi >= 25 && bmi <= 30) bmiCoefficient = 1.25;
      else if (bmi >= 30 && bmi <= 35) bmiCoefficient = 1.5;
      else if (bmi >= 35 && bmi <= 40) bmiCoefficient = 2;
      else if (bmi > 40) bmiCoefficient = 2.5;
    }
  }

  // Видаляємо з таблиці роки, що вже прожив користувач
  personalLifeTable = personalLifeTable.filter(item => item.age > answers.age);

  let chanceImpact = 0;
  let diseases = 0;
  let diseasesImpact = 0;

  // Враховуємо фізичну активність користувача
  if (answers.activityHeavy && answers.activityModerate && answers.activityLight) {
    if (parseInt(answers.activityHeavy) + parseInt(answers.activityModerate) + parseInt(answers.activityLight) === 0) chanceImpact += -810;
  }

  // Враховуємо споживання фруктів, овочів та соків
  if (answers.juice && answers.fruits && answers.vegetables) {
    const foodSum = parseInt(answers.juice) + parseInt(answers.fruits) + parseInt(answers.vegetables);
    if (foodSum === 0) chanceImpact += -390;
    else if (foodSum <= 5) chanceImpact += -70;
    else if (foodSum < 10) chanceImpact += 420;
    else if (foodSum >= 10) chanceImpact += 910;
  }

  // Враховуємо захворювання та додаткові фактори
  for (const [key, value] of Object.entries(answers)) {
    if (value) {
      switch (key) {
        // Захворювання
        case 'cancer': diseasesImpact += -1290; diseases++; break;
        case 'dementia': diseasesImpact += -710; diseases++; break;
        case 'diabetes': diseasesImpact += -670 * bmiCoefficient; diseases++; break;
        case 'epilepsy': diseasesImpact += -660; diseases++; break;
        case 'heart': diseasesImpact += -410 * bmiCoefficient; diseases++; break;
        case 'hypertension': diseasesImpact += -150 * bmiCoefficient; diseases++; break;
        case 'depression': diseasesImpact += -360; diseases++; break;
        case 'ptsd': diseasesImpact += -360; diseases++; break;
        case 'stroke': diseasesImpact += -400 * bmiCoefficient; diseases++; break;
        case 'copd': diseasesImpact += -390; diseases++; break;
        case 'tuberculosis': diseasesImpact += -650; diseases++; break;
        case 'covidSevere': diseasesImpact += -670; diseases++; break;
        case 'covidModerate': diseasesImpact += -370; diseases++; break;
        case 'hiv': diseasesImpact += -700; diseases++; break;

        // Індекс маси тіла
        case 'height':
          if (bmiCoefficient === 0.5) chanceImpact += 1700;
          else if (bmiCoefficient === 0.75) chanceImpact += 200;
          else if (bmiCoefficient === 1.25) chanceImpact += -300;
          else if (bmiCoefficient === 1.5) chanceImpact += -380;
          else if (bmiCoefficient === 2) chanceImpact += -660;
          else if (bmiCoefficient === 2.5) chanceImpact += -980;
          break;

        // Частота медичної допомоги
        case 'ambulance':
        case 'hospitalization':
        case 'consultation':
          chanceImpact += {'none': 800, 'once': -30, 'occasionally': -300, 'often': -700}[value];
          break;

        // Рівень освіти
        case 'education':
          chanceImpact += {'none': -190, 'highschool': -40, 'postsecondary': -30, 'bachelor': 170, 'master': 190, 'doctorate': 420}[value];
          break;

        // Фізична активність
        case 'activityHeavy': chanceImpact += value >= 4 ? 310 : value > 0 ? 110 : -120; break;
        case 'activityModerate': chanceImpact += value >= 4 ? 480 : value > 0 ? 170 : -140; break;
        case 'activityLight': chanceImpact += value >= 4 ? 720 : value > 0 ? 270 : -220; break;

        // Паління
        case 'smoking':
          if (value === 'never') chanceImpact += 1590;
          else if (value === 'quit' || value === 'occasionally') {
            if (value === 'occasionally') chanceImpact += -170;
            if (answers.smokingFormerDaily === 'yes') chanceImpact += -110;
          } else if (value === 'daily') chanceImpact += -490;
          break;

        // Алкоголь
        case 'alcohol':
          chanceImpact += {'occasionally': -30, 'often': -180, 'none': 970}[value];
          break;

        // Доходи
        case 'income':
          chanceImpact += {'poor': -170, 'low': -120, 'belowaverage': -70, 'average': -10, 'aboveaverage': 240}[value];
          break;
        
        // Регіон мешкання
        case 'region':
          switch (value) {
            case 'vinnytsia': chanceImpact += 890; break;
            case 'volyn': chanceImpact += -60; break;
            case 'dnipropetrovsk': chanceImpact += -1180; break;
            case 'zhytomyr': chanceImpact += -1630; break;
            case 'zakarpattia': chanceImpact += -880; break;
            case 'zaporizhzhia': chanceImpact += -520; break;
            case 'frankivsk': chanceImpact += 1480; break;
            case 'kyiv': chanceImpact += -1630; break;
            case 'kirovohrad': chanceImpact += -1240; break;
            case 'lviv': chanceImpact += 1070; break;
            case 'mykolaiv': chanceImpact += -310; break;
            case 'odesa': chanceImpact += -40; break;
            case 'poltava': chanceImpact += -190; break;
            case 'rivne': chanceImpact += -110; break;
            case 'sumy': chanceImpact += -130; break;
            case 'ternopil': chanceImpact += 1700; break;
            case 'kharkiv': chanceImpact += -240; break;
            case 'kherson': chanceImpact += -1300; break;
            case 'khmelnytskyi': chanceImpact += 450; break;
            case 'cherkasy': chanceImpact += 420; break;
            case 'chernivtsi': chanceImpact += 1460; break;
            case 'chernihiv': chanceImpact += -1270; break;
            case 'kyivcity': chanceImpact += 2150; break;
            default: chanceImpact += 0; break;
          }
          break;

        // Внутрішньо переміщені особи
        case 'idp':
          chanceImpact += -120;
          break;
      }
    }
  }

  // Враховуємо загальний вплив захворювань
  chanceImpact += diseasesImpact * diseases * 0.61;

  // Оновлюємо таблицю шансів виживання
  personalLifeTable = adjustLifeTable(personalLifeTable, chanceImpact);
}
