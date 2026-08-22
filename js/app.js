// ========================================
// 抽選データ
// ========================================

let lotteries = [
    {
        name: "○○家電プレゼントキャンペーン",
        status: "applying",
        startDate: "2026-06-20",
        endDate: "2026-06-10",
        resultDate: "2026-06-20"
    },

    {
        name: "△△ポイント還元キャンペーン",
        status: "waiting",
        startDate: "2026-05-15",
        endDate: "2026-06-05",
        resultDate: "2026-06-15"
    },

    {
        name: "□□新商品発売記念キャンペーン",
        status: "planned",
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        resultDate: "2026-07-10"
    },

    {
        name: "☆☆ギフトカードプレゼント",
        status: "winning",
        startDate: "2026-04-10",
        endDate: "2026-04-30",
        resultDate: "2026-05-10"
    }
];


// ========================================
// DOM取得
// ========================================

const pageContainer =
    document.getElementById("pageContainer");

const lotteryList =
    document.getElementById("lotteryList");

const addLotteryButton =
    document.getElementById("addLotteryButton");

const modalBackground =
    document.getElementById("modalBackground");

const closeModal =
    document.getElementById("closeModal");

const cancelButton =
    document.getElementById("cancelButton");

const saveButton =
    document.getElementById("saveButton");

const homeButton =
    document.getElementById("homeButton");

const navButtons =
    document.querySelectorAll(".nav-button");


// ========================================
// LocalStorageから読み込み
// ========================================

function loadLotteries() {

    const saved =
        localStorage.getItem("lotteries");

    if (saved) {

        lotteries =
            JSON.parse(saved);
    }
}


// ========================================
// LocalStorageへ保存
// ========================================

function saveLotteries() {

    localStorage.setItem(
        "lotteries",
        JSON.stringify(lotteries)
    );
}


// ========================================
// ステータス名
// ========================================

function getStatusName(status) {

    switch (status) {

        case "applying":
            return "応募中";

        case "waiting":
            return "結果待ち";

        case "planned":
            return "参加予定";

        case "winning":
            return "当選";

        default:
            return "";
    }
}


// ========================================
// 抽選一覧表示
// ========================================

function renderLotteryList() {

    lotteryList.innerHTML = "";

    lotteries.forEach(lottery => {

        const item =
            document.createElement("div");

        item.className =
            "lottery-item";

        item.innerHTML = `

            <div class="lottery-top">

                <span class="status-label ${lottery.status}">
                    ${getStatusName(lottery.status)}
                </span>

                <span class="lottery-name">
                    ${lottery.name}
                </span>

            </div>

            <div class="lottery-date">
                応募期間：
                ${lottery.startDate}
                ～ ${lottery.endDate}
            </div>

            <div class="lottery-date">
                結果発表：
                ${lottery.resultDate}
            </div>

            <span class="arrow">
                ›
            </span>
        `;

        lotteryList.appendChild(item);
    });


    updateStatusCount();
}


// ========================================
// ステータス件数
// ========================================

function updateStatusCount() {

    const planned =
        lotteries.filter(
            x => x.status === "planned"
        ).length;

    const applying =
        lotteries.filter(
            x => x.status === "applying"
        ).length;

    const waiting =
        lotteries.filter(
            x => x.status === "waiting"
        ).length;

    const winning =
        lotteries.filter(
            x => x.status === "winning"
        ).length;


    document.getElementById(
        "plannedCount"
    ).textContent = planned;

    document.getElementById(
        "applyingCount"
    ).textContent = applying;

    document.getElementById(
        "waitingCount"
    ).textContent = waiting;

    document.getElementById(
        "winningCount"
    ).textContent = winning;
}


// ========================================
// ページ切り替え
// ========================================

function goToPage(pageIndex) {

    const width =
        pageContainer.clientWidth;

    pageContainer.scrollTo({

        left: width * pageIndex,

        behavior: "smooth"
    });


    updateNavigation(pageIndex);
}


// ========================================
// 下部ナビの状態変更
// ========================================

function updateNavigation(pageIndex) {

    navButtons.forEach(
        button => button.classList.remove("active")
    );


    if (pageIndex === 0) {

        navButtons[0]
            .classList.add("active");

    } else if (pageIndex === 1) {

        navButtons[1]
            .classList.add("active");
    }
}


// ========================================
// 横スクロール位置を監視
// ========================================

pageContainer.addEventListener(
    "scroll",
    () => {

        const pageWidth =
            pageContainer.clientWidth;

        const currentPage =
            Math.round(
                pageContainer.scrollLeft /
                pageWidth
            );

        updateNavigation(currentPage);
    }
);


// ========================================
// ナビゲーション
// ========================================

navButtons.forEach(
    (button, index) => {

        button.addEventListener(
            "click",
            () => {

                if (index === 0) {

                    goToPage(0);

                } else if (index === 1) {

                    goToPage(1);
                }
            }
        );
    }
);


// ========================================
// カレンダーからホームへ
// ========================================

homeButton.addEventListener(
    "click",
    () => {

        goToPage(0);
    }
);


// ========================================
// モーダル表示
// ========================================

addLotteryButton.addEventListener(
    "click",
    () => {

        modalBackground.classList.add(
            "show"
        );
    }
);


// ========================================
// モーダル閉じる
// ========================================

closeModal.addEventListener(
    "click",
    closeModalWindow
);


cancelButton.addEventListener(
    "click",
    closeModalWindow
);


function closeModalWindow() {

    modalBackground.classList.remove(
        "show"
    );
}


// ========================================
// 抽選登録
// ========================================

saveButton.addEventListener(
    "click",
    () => {

        const name =
            document.getElementById(
                "lotteryName"
            ).value;

        const startDate =
            document.getElementById(
                "startDate"
            ).value;

        const endDate =
            document.getElementById(
                "endDate"
            ).value;

        const resultDate =
            document.getElementById(
                "resultDate"
            ).value;

        const url =
            document.getElementById(
                "lotteryUrl"
            ).value;

        const memo =
            document.getElementById(
                "lotteryMemo"
            ).value;


        if (!name) {

            alert("抽選名を入力してください");

            return;
        }


        const newLottery = {

            name: name,

            status: "planned",

            startDate: startDate,

            endDate: endDate,

            resultDate: resultDate,

            url: url,

            memo: memo
        };


        lotteries.push(
            newLottery
        );


        saveLotteries();

        renderLotteryList();

        renderCalendar();


        closeModalWindow();


        document.getElementById(
            "lotteryName"
        ).value = "";

        document.getElementById(
            "startDate"
        ).value = "";

        document.getElementById(
            "endDate"
        ).value = "";

        document.getElementById(
            "resultDate"
        ).value = "";

        document.getElementById(
            "lotteryUrl"
        ).value = "";

        document.getElementById(
            "lotteryMemo"
        ).value = "";
    }
);


// ========================================
// カレンダー
// ========================================

let currentDate =
    new Date();

let selectedDate =
    new Date();


function renderCalendar() {

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    document.getElementById(
        "calendarTitle"
    ).textContent =
        `${year}年${month + 1}月`;


    const grid =
        document.getElementById(
            "calendarGrid"
        );

    grid.innerHTML = "";


    // 月初曜日
    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    // 月末日
    const lastDate =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    // 前月の日付
    const previousLastDate =
        new Date(
            year,
            month,
            0
        ).getDate();


    // 前月分
    for (
        let i = firstDay - 1;
        i >= 0;
        i--
    ) {

        const day =
            previousLastDate - i;

        const cell =
            createCalendarCell(
                day,
                true
            );

        grid.appendChild(cell);
    }


    // 当月
    for (
        let day = 1;
        day <= lastDate;
        day++
    ) {

        const cell =
            createCalendarCell(
                day,
                false
            );

        grid.appendChild(cell);
    }


    // 次月
    const remaining =
        42 - grid.children.length;


    for (
        let day = 1;
        day <= remaining;
        day++
    ) {

        const cell =
            createCalendarCell(
                day,
                true
            );

        grid.appendChild(cell);
    }
}


// ========================================
// カレンダーセル作成
// ========================================

function createCalendarCell(
    day,
    otherMonth
) {

    const cell =
        document.createElement("div");

    cell.className =
        "calendar-day";


    if (otherMonth) {

        cell.classList.add(
            "other-month"
        );
    }


    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    const date =
        new Date(
            year,
            month,
            day
        );


    const dateString =
        formatDate(date);


    const dayNumber =
        document.createElement("span");

    dayNumber.className =
        "day-number";

    dayNumber.textContent =
        day;


    cell.appendChild(
        dayNumber
    );


    // 今日
    const today =
        new Date();


    if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    ) {

        cell.classList.add(
            "today"
        );
    }


    // 抽選イベント
    lotteries.forEach(
        lottery => {

            if (
                lottery.startDate ===
                dateString
            ) {

                addEvent(
                    cell,
                    "応募開始",
                    "event-start"
                );
            }


            if (
                lottery.endDate ===
                dateString
            ) {

                addEvent(
                    cell,
                    "締切",
                    "event-deadline"
                );
            }


            if (
                lottery.resultDate ===
                dateString
            ) {

                addEvent(
                    cell,
                    "結果発表",
                    "event-result"
                );
            }
        }
    );


    // 日付タップ
    cell.addEventListener(
        "click",
        () => {

            selectedDate =
                date;

            renderSchedule(
                date
            );
        }
    );


    return cell;
}


// ========================================
// カレンダーイベント
// ========================================

function addEvent(
    cell,
    text,
    className
) {

    const event =
        document.createElement("div");

    event.className =
        `calendar-event ${className}`;

    event.textContent =
        text;

    cell.appendChild(
        event
    );
}


// ========================================
// 日付フォーマット
// ========================================

function formatDate(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


// ========================================
// 選択日の予定
// ========================================

function renderSchedule(date) {

    const title =
        document.getElementById(
            "selectedDateTitle"
        );


    const month =
        date.getMonth() + 1;

    const day =
        date.getDate();


    const weekday =
        [
            "日",
            "月",
            "火",
            "水",
            "木",
            "金",
            "土"
        ][date.getDay()];


    title.textContent =
        `${month}月${day}日（${weekday}）の予定`;


    const list =
        document.getElementById(
            "scheduleList"
        );


    list.innerHTML = "";


    const targetDate =
        formatDate(date);


    lotteries.forEach(
        lottery => {

            let type = "";

            if (
                lottery.startDate ===
                targetDate
            ) {

                type = "応募開始";
            }

            else if (
                lottery.endDate ===
                targetDate
            ) {

                type = "応募締切";
            }

            else if (
                lottery.resultDate ===
                targetDate
            ) {

                type = "結果発表";
            }


            if (type) {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "schedule-item";


                item.innerHTML = `

                    <div class="schedule-dot"></div>

                    <div>

                        <div class="schedule-title">
                            ${lottery.name}
                        </div>

                        <div class="schedule-sub">
                            ${type}
                        </div>

                    </div>

                `;


                list.appendChild(item);
            }
        }
    );


    if (!list.children.length) {

        list.innerHTML = `
            <div class="schedule-item">
                <div class="schedule-sub">
                    この日の予定はありません
                </div>
            </div>
        `;
    }
}


// ========================================
// 前月・次月
// ========================================

document.getElementById(
    "prevMonth"
).addEventListener(
    "click",
    () => {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        renderCalendar();
    }
);


document.getElementById(
    "nextMonth"
).addEventListener(
    "click",
    () => {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        renderCalendar();
    }
);


// ========================================
// 今日
// ========================================

document.getElementById(
    "todayButton"
).addEventListener(
    "click",
    () => {

        currentDate =
            new Date();

        selectedDate =
            new Date();

        renderCalendar();

        renderSchedule(
            selectedDate
        );
    }
);


// ========================================
// 初期化
// ========================================

loadLotteries();

renderLotteryList();

renderCalendar();

renderSchedule(
    selectedDate
);