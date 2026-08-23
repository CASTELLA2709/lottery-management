// ============================================================
// 抽選・応募管理アプリ
//
// ・キャンペーン
//      └ 応募枠を何件でも登録
//
// ・抽選
// ・先着
// ・その他
//
// ・1次 → 2次 → 3次・・・
// ・FC先行 → 一般販売
// ・敗者復活
// ・追加受付
//
// などを自由に管理できます。
// ============================================================


const STORAGE_KEY = "lotteryAppDataV1";


/* ============================================================
   アプリデータ
============================================================ */

let data = {

    groups: [

        {
            id: createId(),

            name: "○○ライブ チケット",

            memo:
                "複数の先行・販売をまとめて管理",

            favorite: false,

            entries: [

                {
                    id: createId(),

                    name: "FC先行",

                    method: "lottery",

                    status: "lost",

                    start: "2026-06-01T10:00",

                    end: "2026-06-10T23:59",

                    result: "2026-06-15T18:00",

                    url: "",

                    memo: ""
                },


                {
                    id: createId(),

                    name: "プレリク先行",

                    method: "lottery",

                    status: "waiting",

                    start: "2026-06-16T10:00",

                    end: "2026-06-20T23:59",

                    result: "2026-06-25T18:00",

                    url: "",

                    memo: ""
                },


                {
                    id: createId(),

                    name: "一般販売",

                    method: "first-come",

                    status: "planned",

                    start: "2026-06-28T10:00",

                    end: "",

                    result: "",

                    url: "",

                    memo:
                        "売り切れ次第終了"
                }

            ]
        }

    ]
};


/* ============================================================
   現在選択中の情報
============================================================ */

let currentGroupId = null;

let editingEntryId = null;

let currentDate = new Date();

let selectedDate = new Date();


/* ============================================================
   DOM
============================================================ */

const pageContainer =
    document.getElementById(
        "pageContainer"
    );


const groupList =
    document.getElementById(
        "groupList"
    );


const groupModalBackground =
    document.getElementById(
        "groupModalBackground"
    );


const entryModalBackground =
    document.getElementById(
        "entryModalBackground"
    );


const detailModalBackground =
    document.getElementById(
        "detailModalBackground"
    );


const searchModalBackground =
    document.getElementById(
        "searchModalBackground"
    );


/* ============================================================
   初期処理
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadData();

        renderGroups();

        renderCalendar();

        renderSchedule(
            selectedDate
        );

        updateCounts();

        setupEvents();

    }
);


/* ============================================================
   ID生成
============================================================ */

function createId() {

    return (
        Date.now().toString(36)
        +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


/* ============================================================
   LocalStorage
============================================================ */

function loadData() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!saved) {

        saveData();

        return;
    }


    try {

        data =
            JSON.parse(saved);

    } catch (error) {

        console.error(
            "データ読み込み失敗",
            error
        );

    }

}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* ============================================================
   画面切り替え
============================================================ */

function goToPage(index) {

    pageContainer.scrollTo({

        left:
            pageContainer.clientWidth
            * index,

        behavior: "smooth"

    });


    updateNavigation(index);

}


function updateNavigation(index) {

    document
        .querySelectorAll(
            ".nav-button"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


    const button =
        document.querySelector(
            `.nav-button[data-page="${index}"]`
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }

}


/* ============================================================
   横スクロール検知
============================================================ */

pageContainer.addEventListener(
    "scroll",
    function () {

        const width =
            pageContainer.clientWidth;


        if (!width) {

            return;
        }


        const index =
            Math.round(
                pageContainer.scrollLeft
                / width
            );


        updateNavigation(index);

    }
);


/* ============================================================
   イベント
============================================================ */

function setupEvents() {


    /* ホーム / カレンダー */

    document
        .querySelectorAll(
            ".nav-button[data-page]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        goToPage(
                            Number(
                                button.dataset.page
                            )
                        );

                    }
                );

            }
        );


    /* ホーム */

    document
        .getElementById(
            "homeButton"
        )
        .addEventListener(
            "click",
            function () {

                goToPage(0);

            }
        );


    /* 新規グループ */

    document
        .getElementById(
            "addGroupButton"
        )
        .addEventListener(
            "click",
            openGroupModal
        );


    /* グループモーダル */

    document
        .getElementById(
            "closeGroupModal"
        )
        .addEventListener(
            "click",
            closeAllModals
        );


    document
        .getElementById(
            "cancelGroupButton"
        )
        .addEventListener(
            "click",
            closeAllModals
        );


    document
        .getElementById(
            "saveGroupButton"
        )
        .addEventListener(
            "click",
            saveGroup
        );


    /* 応募枠モーダル */

    document
        .getElementById(
            "closeEntryModal"
        )
        .addEventListener(
            "click",
            closeAllModals
        );


    document
        .getElementById(
            "cancelEntryButton"
        )
        .addEventListener(
            "click",
            closeAllModals
        );


    document
        .getElementById(
            "saveEntryButton"
        )
        .addEventListener(
            "click",
            saveEntry
        );


    /* 詳細 */

    document
        .getElementById(
            "closeDetailModal"
        )
        .addEventListener(
            "click",
            closeAllModals
        );


    document
        .getElementById(
            "addRelatedEntryButton"
        )
        .addEventListener(
            "click",
            function () {

                if (!currentGroupId) {
                    return;
                }

                const groupId =
                    currentGroupId;

                /*
                * 詳細画面を閉じる
                */
                detailModalBackground
                    .classList.remove(
                        "show"
                    );

                /*
                * 応募枠登録画面を開く
                */
                openEntryModal(
                    groupId
                );

            }
        );


    /* カレンダー */

    document
        .getElementById(
            "prevMonth"
        )
        .addEventListener(
            "click",
            function () {

                currentDate.setMonth(
                    currentDate.getMonth() - 1
                );

                renderCalendar();

            }
        );


    document
        .getElementById(
            "nextMonth"
        )
        .addEventListener(
            "click",
            function () {

                currentDate.setMonth(
                    currentDate.getMonth() + 1
                );

                renderCalendar();

            }
        );


    document
        .getElementById(
            "todayButton"
        )
        .addEventListener(
            "click",
            function () {

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


    /* すべて表示 */

    document
        .getElementById(
            "showAllButton"
        )
        .addEventListener(
            "click",
            function () {

                renderGroups(true);

            }
        );


    /* 検索 */

    document
        .getElementById(
            "searchButton"
        )
        .addEventListener(
            "click",
            openSearch
        );


    document
        .getElementById(
            "closeSearchModal"
        )
        .addEventListener(
            "click",
            closeAllModals
        );


    document
        .getElementById(
            "searchInput"
        )
        .addEventListener(
            "input",
            renderSearchResults
        );


    /* お気に入り */

    document
        .getElementById(
            "favoriteButton"
        )
        .addEventListener(
            "click",
            function () {

                renderGroups(
                    true,
                    true
                );

                goToPage(0);

            }
        );

}


/* ============================================================
   ラベル
============================================================ */

const STATUS_LABELS = {

    planned: "応募予定",

    applying: "応募中",

    waiting: "結果待ち",

    won: "当選",

    lost: "落選",

    completed: "参加済み",

    cancelled: "キャンセル"

};


const METHOD_LABELS = {

    lottery: "抽選",

    "first-come": "先着",

    other: "その他"

};


function getStatusLabel(status) {

    return (
        STATUS_LABELS[status]
        || status
    );

}


function getMethodLabel(method) {

    return (
        METHOD_LABELS[method]
        || method
    );

}


/* ============================================================
   件数
============================================================ */

function updateCounts() {

    const entries =
        data.groups.flatMap(
            group => group.entries
        );


    document
        .getElementById(
            "plannedCount"
        )
        .textContent =
        entries.filter(
            entry =>
                entry.status === "planned"
        ).length;


    document
        .getElementById(
            "applyingCount"
        )
        .textContent =
        entries.filter(
            entry =>
                entry.status === "applying"
        ).length;


    document
        .getElementById(
            "waitingCount"
        )
        .textContent =
        entries.filter(
            entry =>
                entry.status === "waiting"
        ).length;


    document
        .getElementById(
            "winningCount"
        )
        .textContent =
        entries.filter(
            entry =>
                entry.status === "won"
        ).length;

}


/* ============================================================
   メイン画面
============================================================ */

function renderGroups(
    showAll = false,
    favoritesOnly = false
) {

    groupList.innerHTML = "";


    let groups =
        data.groups;


    if (favoritesOnly) {

        groups =
            groups.filter(
                group =>
                    group.favorite
            );

    }


    if (!showAll) {

        groups =
            groups.slice(0, 10);

    }


    if (!groups.length) {

        groupList.innerHTML = `
            <div class="group-summary">
                登録されている応募はありません。
            </div>
        `;

        return;
    }


    groups.forEach(
        group => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "group-card";


            const methods =
                [
                    ...new Set(
                        group.entries.map(
                            entry =>
                                entry.method
                        )
                    )
                ];


            const entriesHtml =
                group.entries
                    .map(
                        entry => `

                            <div class="entry-mini">

                                <div
                                    class="entry-mini-left">

                                    <div
                                        class="entry-mini-name">

                                        ${escapeHtml(
                                            entry.name
                                        )}

                                    </div>

                                    <div
                                        class="entry-mini-date">

                                        ${getDateRangeText(
                                            entry
                                        )}

                                    </div>

                                </div>


                                <span
                                    class="
                                        entry-mini-status
                                        status-${entry.status}
                                    ">

                                    ${getStatusLabel(
                                        entry.status
                                    )}

                                </span>

                            </div>

                        `
                    )
                    .join("");


            card.innerHTML = `

                <div
                    class="group-card-header">

                    <div
                        class="group-header-info">

                        <div
                            class="group-name">

                            ${escapeHtml(
                                group.name
                            )}

                            ${
                                group.favorite
                                ? '<span class="favorite">★</span>'
                                : ""
                            }

                        </div>


                        <div
                            class="group-summary">

                            応募枠
                            ${group.entries.length}
                            件

                        </div>

                    </div>


                    <button
                        type="button"
                        class="delete-group-icon"
                        data-group-id="${group.id}"
                        aria-label="イベントを削除">

                        🗑️

                    </button>

                </div>


                <div
                    class="group-badges">

                    ${
                        methods.map(
                            method => `

                                <span
                                    class="
                                        badge
                                        ${method}
                                    ">

                                    ${getMethodLabel(
                                        method
                                    )}

                                </span>

                            `
                        ).join("")
                    }

                </div>


                <div
                    class="entry-mini-list">

                    ${entriesHtml}

                </div>


                <div
                    class="group-actions">

                    <button
                        class="small-button detail-button">

                        詳細・履歴

                    </button>


                    <button
                        class="small-button related-button">

                        ＋ 関連応募

                    </button>


                    <button
                        class="small-button favorite-button">

                        ${
                            group.favorite
                            ? "お気に入り解除"
                            : "お気に入り"
                        }

                    </button>

                </div>

            `;

            /* イベント削除 */

card
    .querySelector(
        ".delete-group-icon"
    )
    .addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            const groupId =
                this.dataset.groupId;

            deleteGroup(
                groupId
            );

        }
    );


            /* 詳細 */

            card
                .querySelector(
                    ".detail-button"
                )
                .addEventListener(
                    "click",
                    function () {

                        openDetail(
                            group.id
                        );

                    }
                );


            /* 関連応募 */

            card
                .querySelector(
                    ".related-button"
                )
                .addEventListener(
                    "click",
                    function () {

                        openEntryModal(
                            group.id
                        );

                    }
                );


            /* お気に入り */

            card
                .querySelector(
                    ".favorite-button"
                )
                .addEventListener(
                    "click",
                    function () {

                        group.favorite =
                            !group.favorite;

                        saveData();

                        renderGroups(
                            showAll,
                            favoritesOnly
                        );

                    }
                );


            groupList.appendChild(
                card
            );

        }
    );


    updateCounts();

}


/* ============================================================
   グループ登録画面
============================================================ */

function openGroupModal() {

    document
        .getElementById(
            "groupName"
        )
        .value = "";


    document
        .getElementById(
            "groupMemo"
        )
        .value = "";


    groupModalBackground
        .classList.add(
            "show"
        );

}


function saveGroup() {

    const name =
        document
            .getElementById(
                "groupName"
            )
            .value
            .trim();


    const memo =
        document
            .getElementById(
                "groupMemo"
            )
            .value
            .trim();


    if (!name) {

        alert(
            "キャンペーン名を入力してください。"
        );

        return;
    }


    const group = {

        id: createId(),

        name: name,

        memo: memo,

        favorite: false,

        entries: []

    };


    data.groups.push(
        group
    );


    saveData();

    closeAllModals();

    renderGroups();


    /* 登録後すぐ応募枠登録 */

    openEntryModal(
        group.id
    );

}


/* ============================================================
   応募枠登録
============================================================ */

function openEntryModal(
    groupId,
    entryId = null
) {

    currentGroupId =
        groupId;

    editingEntryId =
        entryId;


    const group =
        findGroup(
            groupId
        );


    if (!group) {

        return;
    }


    document
        .getElementById(
            "parentGroupName"
        )
        .textContent =
        "関連先：" +
        group.name;


    document
        .getElementById(
            "entryModalTitle"
        )
        .textContent =
        entryId
        ? "応募枠を編集"
        : "応募枠を登録";


    let entry = null;


    if (entryId) {

        entry =
            group.entries.find(
                x =>
                    x.id === entryId
            );

    }


    document
        .getElementById(
            "entryName"
        )
        .value =
        entry?.name || "";


    document
        .getElementById(
            "entryMethod"
        )
        .value =
        entry?.method || "lottery";


    document
        .getElementById(
            "entryStatus"
        )
        .value =
        entry?.status || "planned";


    document
        .getElementById(
            "entryStart"
        )
        .value =
        entry?.start || "";


    document
        .getElementById(
            "entryEnd"
        )
        .value =
        entry?.end || "";


    document
        .getElementById(
            "entryResult"
        )
        .value =
        entry?.result || "";


    document
        .getElementById(
            "entryUrl"
        )
        .value =
        entry?.url || "";


    document
        .getElementById(
            "entryMemo"
        )
        .value =
        entry?.memo || "";


    entryModalBackground
        .classList.add(
            "show"
        );

}

function editEntryFromDetail(
    groupId,
    entryId
) {

    /*
     * 詳細画面を閉じる
     */
    detailModalBackground
        .classList.remove(
            "show"
        );


    /*
     * 編集画面を開く
     */
    openEntryModal(
        groupId,
        entryId
    );


    /*
     * 編集画面を一番上にする
     */
    const modal =
        entryModalBackground
            .querySelector(".modal");

    if (modal) {

        modal.scrollTop = 0;

    }

}


/* ============================================================
   応募枠保存
============================================================ */

function saveEntry() {

    const group =
        findGroup(
            currentGroupId
        );


    if (!group) {

        return;
    }


    const name =
        document
            .getElementById(
                "entryName"
            )
            .value
            .trim();


    if (!name) {

        alert(
            "応募枠名を入力してください。"
        );

        return;
    }


    const entry = {

        id:
            editingEntryId
            || createId(),

        name: name,

        method:
            document
                .getElementById(
                    "entryMethod"
                )
                .value,

        status:
            document
                .getElementById(
                    "entryStatus"
                )
                .value,

        start:
            document
                .getElementById(
                    "entryStart"
                )
                .value,

        end:
            document
                .getElementById(
                    "entryEnd"
                )
                .value,

        result:
            document
                .getElementById(
                    "entryResult"
                )
                .value,

        url:
            document
                .getElementById(
                    "entryUrl"
                )
                .value
                .trim(),

        memo:
            document
                .getElementById(
                    "entryMemo"
                )
                .value
                .trim()

    };


    if (editingEntryId) {

        const index =
            group.entries.findIndex(
                entry =>
                    entry.id ===
                    editingEntryId
            );


        if (index >= 0) {

            group.entries[index] =
                entry;

        }

    } else {

        group.entries.push(
            entry
        );

    }


    saveData();

    closeAllModals();

    renderGroups();

    renderCalendar();

    renderSchedule(
        selectedDate
    );


    /* 詳細画面 */

    openDetail(
        group.id
    );

}


/* ============================================================
   詳細画面
============================================================ */

function openDetail(
    groupId
) {

    currentGroupId =
        groupId;


    const group =
        findGroup(
            groupId
        );


    if (!group) {

        return;
    }


    const content =
        document.getElementById(
            "detailContent"
        );


    let html = `

        <div class="group-name">

            ${escapeHtml(
                group.name
            )}

        </div>

    `;


    if (group.memo) {

        html += `

            <div class="group-summary">

                ${escapeHtml(
                    group.memo
                )}

            </div>

        `;

    }


    group.entries.forEach(
        function (
            entry,
            index
        ) {

            html += `

                <div
                    class="detail-entry">

                    <div
                        class="detail-entry-title">

                        <span>

                            ${index + 1}.
                            ${escapeHtml(
                                entry.name
                            )}

                        </span>


                        <span
                            class="
                                entry-mini-status
                                status-${entry.status}
                            ">

                            ${getStatusLabel(
                                entry.status
                            )}

                        </span>

                    </div>


                    <div
                        class="detail-line">

                        方式：
                        ${getMethodLabel(
                            entry.method
                        )}

                    </div>


                    <div
                        class="detail-line">

                        期間：
                        ${getDateRangeText(
                            entry
                        )}

                    </div>


                    ${
                        entry.result
                        ? `

                            <div
                                class="detail-line">

                                結果発表：
                                ${formatDateTime(
                                    entry.result
                                )}

                            </div>

                        `
                        : ""
                    }


                    ${
                        entry.memo
                        ? `

                            <div
                                class="detail-line">

                                メモ：
                                ${escapeHtml(
                                    entry.memo
                                )}

                            </div>

                        `
                        : ""
                    }


                    ${
                        entry.url
                        ? `

                            <div
                                class="detail-line">

                                <a
                                    href="${escapeHtml(entry.url)}"
                                    target="_blank">

                                    応募ページを開く

                                </a>

                            </div>

                        `
                        : ""
                    }


                    <div
                        class="detail-actions">

                        <button
                            class="small-button"
                            onclick="
                                editEntryFromDetail(
                                    '${group.id}',
                                    '${entry.id}'
                                )
                            ">

                            編集

                        </button>


                        <button
                            class="small-button"
                            onclick="
                                deleteEntry(
                                    '${group.id}',
                                    '${entry.id}'
                                )
                            ">

                            削除

                        </button>

                    </div>

                </div>

            `;

        }
    );


    if (!group.entries.length) {

        html += `

            <div class="group-summary">

                応募枠はまだありません。

            </div>

        `;

    }


    content.innerHTML =
        html;


    detailModalBackground
        .classList.add(
            "show"
        );

}


/* ============================================================
   応募枠削除
============================================================ */

function deleteEntry(
    groupId,
    entryId
) {

    const group =
        findGroup(
            groupId
        );


    if (!group) {

        return;
    }


    const entry =
        group.entries.find(
            entry =>
                entry.id ===
                entryId
        );


    if (!entry) {

        return;
    }


    if (
        !confirm(
            `「${entry.name}」を削除しますか？`
        )
    ) {

        return;
    }


    group.entries =
        group.entries.filter(
            entry =>
                entry.id !==
                entryId
        );


    saveData();

    renderGroups();

    renderCalendar();

    renderSchedule(
        selectedDate
    );


    openDetail(
        groupId
    );

}


/* ============================================================
   検索
============================================================ */

function openSearch() {

    document
        .getElementById(
            "searchInput"
        )
        .value = "";


    document
        .getElementById(
            "searchResultList"
        )
        .innerHTML = "";


    searchModalBackground
        .classList.add(
            "show"
        );


    setTimeout(
        function () {

            document
                .getElementById(
                    "searchInput"
                )
                .focus();

        },
        100
    );

}


function renderSearchResults() {

    const keyword =
        document
            .getElementById(
                "searchInput"
            )
            .value
            .trim()
            .toLowerCase();


    const resultList =
        document
            .getElementById(
                "searchResultList"
            );


    if (!keyword) {

        resultList.innerHTML = "";

        return;
    }


    const results = [];


    data.groups.forEach(
        function (group) {

            group.entries.forEach(
                function (entry) {

                    const text =
                        (
                            group.name
                            + " "
                            + entry.name
                            + " "
                            + entry.memo
                        )
                        .toLowerCase();


                    if (
                        text.includes(
                            keyword
                        )
                    ) {

                        results.push({

                            group,
                            entry

                        });

                    }

                }
            );

        }
    );


    if (!results.length) {

        resultList.innerHTML = `

            <div class="group-summary">

                該当する応募はありません。

            </div>

        `;

        return;
    }


    resultList.innerHTML =
        results.map(
            result => `

                <div
                    class="search-result">

                    <div
                        class="search-result-title">

                        ${escapeHtml(
                            result.group.name
                        )}

                        /

                        ${escapeHtml(
                            result.entry.name
                        )}

                    </div>


                    <div
                        class="search-result-sub">

                        ${getMethodLabel(
                            result.entry.method
                        )}

                        ・

                        ${getStatusLabel(
                            result.entry.status
                        )}

                    </div>

                </div>

            `
        ).join("");

}


/* ============================================================
   カレンダー
============================================================ */

function renderCalendar() {

    const year =
        currentDate.getFullYear();


    const month =
        currentDate.getMonth();


    document
        .getElementById(
            "calendarTitle"
        )
        .textContent =
        `${year}年${month + 1}月`;


    const grid =
        document.getElementById(
            "calendarGrid"
        );


    grid.innerHTML = "";


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const lastDate =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const previousLastDate =
        new Date(
            year,
            month,
            0
        ).getDate();


    /* 前月 */

    for (
        let i = firstDay - 1;
        i >= 0;
        i--
    ) {

        const day =
            previousLastDate - i;


        const date =
            new Date(
                year,
                month - 1,
                day
            );


        grid.appendChild(
            createCalendarCell(
                date,
                true
            )
        );

    }


    /* 今月 */

    for (
        let day = 1;
        day <= lastDate;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        grid.appendChild(
            createCalendarCell(
                date,
                false
            )
        );

    }


    /* 次月 */

    while (
        grid.children.length < 42
    ) {

        const day =
            grid.children.length
            - firstDay
            - lastDate
            + 1;


        const date =
            new Date(
                year,
                month + 1,
                day
            );


        grid.appendChild(
            createCalendarCell(
                date,
                true
            )
        );

    }

}


/* ============================================================
   カレンダーの日
============================================================ */

function createCalendarCell(
    date,
    otherMonth
) {

    const cell =
        document.createElement(
            "div"
        );


    cell.className =
        "calendar-day";


    if (otherMonth) {

        cell.classList.add(
            "other-month"
        );

    }


    const number =
        document.createElement(
            "span"
        );


    number.className =
        "day-number";


    number.textContent =
        date.getDate();


    cell.appendChild(
        number
    );


    const today =
        new Date();


    if (
        isSameDate(
            date,
            today
        )
    ) {

        cell.classList.add(
            "today"
        );

    }


    const dateString =
        formatDateOnly(
            date
        );


    const events =
        getCalendarEvents(
            dateString
        );


    events
        .slice(0, 3)
        .forEach(
            event => {

                const element =
                    document.createElement(
                        "div"
                    );


                element.className =
                    "calendar-event "
                    + event.className;


                element.textContent =
                    event.text;


                element.title =
                    event.text;


                cell.appendChild(
                    element
                );

            }
        );


    if (
        events.length > 3
    ) {

        const more =
            document.createElement(
                "div"
            );


        more.className =
            "calendar-event";


        more.textContent =
            `＋${events.length - 3}件`;


        cell.appendChild(
            more
        );

    }


    cell.addEventListener(
        "click",
        function () {

            selectedDate =
                date;


            renderSchedule(
                date
            );

        }
    );


    return cell;

}


/* ============================================================
   カレンダーイベント
============================================================ */

function getCalendarEvents(
    dateString
) {

    const events = [];


    data.groups.forEach(
        function (group) {

            group.entries.forEach(
                function (entry) {


                    /* 応募開始 */

                    if (
                        entry.start
                        &&
                        entry.start.startsWith(
                            dateString
                        )
                    ) {

                        events.push({

                            text:
                                group.name
                                +
                                (
                                    entry.method
                                    ===
                                    "first-come"

                                    ? " 先着開始"

                                    : " 応募開始"
                                ),

                            className:
                                "event-start"

                        });

                    }


                    /* 締切 */

                    if (
                        entry.end
                        &&
                        entry.end.startsWith(
                            dateString
                        )
                    ) {

                        events.push({

                            text:
                                group.name
                                +
                                " 締切",

                            className:
                                "event-deadline"

                        });

                    }


                    /* 結果発表 */

                    if (
                        entry.result
                        &&
                        entry.result.startsWith(
                            dateString
                        )
                    ) {

                        events.push({

                            text:
                                group.name
                                +
                                " 結果発表",

                            className:
                                "event-result"

                        });

                    }

                }
            );

        }
    );


    return events;

}


/* ============================================================
   選択日の予定
============================================================ */

function renderSchedule(
    date
) {

    const title =
        document.getElementById(
            "selectedDateTitle"
        );


    const weekdays = [
        "日",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土"
    ];


    title.textContent =
        `${date.getMonth() + 1}月${date.getDate()}日（${weekdays[date.getDay()]}）の予定`;


    const list =
        document.getElementById(
            "scheduleList"
        );


    list.innerHTML = "";


    const targetDate =
        formatDateOnly(
            date
        );


    const schedules = [];


    data.groups.forEach(
        function (group) {

            group.entries.forEach(
                function (entry) {


                    /* 開始 */

                    if (
                        entry.start
                        &&
                        entry.start.startsWith(
                            targetDate
                        )
                    ) {

                        schedules.push({

                            type:
                                entry.method
                                ===
                                "first-come"

                                ? "先着開始"

                                : "応募開始",

                            group,
                            entry,

                            dateTime:
                                entry.start

                        });

                    }


                    /* 締切 */

                    if (
                        entry.end
                        &&
                        entry.end.startsWith(
                            targetDate
                        )
                    ) {

                        schedules.push({

                            type:
                                "応募締切",

                            group,
                            entry,

                            dateTime:
                                entry.end

                        });

                    }


                    /* 結果発表 */

                    if (
                        entry.result
                        &&
                        entry.result.startsWith(
                            targetDate
                        )
                    ) {

                        schedules.push({

                            type:
                                "結果発表",

                            group,
                            entry,

                            dateTime:
                                entry.result

                        });

                    }

                }
            );

        }
    );


    schedules.sort(
        function (a, b) {

            return a.dateTime
                .localeCompare(
                    b.dateTime
                );

        }
    );


    if (
        !schedules.length
    ) {

        list.innerHTML = `

            <div class="schedule-item">

                <div class="schedule-sub">

                    この日の予定はありません

                </div>

            </div>

        `;

        return;
    }


    schedules.forEach(
        function (schedule) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "schedule-item";


            item.innerHTML = `

                <div
                    class="schedule-dot">
                </div>


                <div>

                    <div
                        class="schedule-title">

                        ${escapeHtml(
                            schedule.group.name
                        )}

                    </div>


                    <div
                        class="schedule-sub">

                        ${escapeHtml(
                            schedule.entry.name
                        )}

                        <span
                            class="schedule-method">

                            ${getMethodLabel(
                                schedule.entry.method
                            )}

                        </span>


                        <br>


                        ${schedule.type}：

                        ${formatTime(
                            schedule.dateTime
                        )}

                    </div>

                </div>

            `;


            list.appendChild(
                item
            );

        }
    );

}


/* ============================================================
   ユーティリティ
============================================================ */

function findGroup(
    groupId
) {

    return data.groups.find(
        group =>
            group.id ===
            groupId
    );

}


function formatDateOnly(
    date
) {

    const y =
        date.getFullYear();


    const m =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const d =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${y}-${m}-${d}`;

}


function formatDateTime(
    value
) {

    if (!value) {

        return "未設定";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return (
        `${date.getFullYear()}/`
        +
        `${String(
            date.getMonth() + 1
        ).padStart(2, "0")}/`
        +
        `${String(
            date.getDate()
        ).padStart(2, "0")} `
        +
        `${String(
            date.getHours()
        ).padStart(2, "0")}:`
        +
        `${String(
            date.getMinutes()
        ).padStart(2, "0")}`
    );

}


function formatTime(
    value
) {

    if (!value) {

        return "時刻未設定";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return (
        String(
            date.getHours()
        ).padStart(2, "0")
        +
        ":"
        +
        String(
            date.getMinutes()
        ).padStart(2, "0")
    );

}


function getDateRangeText(
    entry
) {

    const start =
        entry.start
        ? formatDateTime(
            entry.start
        )
        : "開始日未設定";


    const end =
        entry.end
        ? formatDateTime(
            entry.end
        )
        : "終了日未定";


    return (
        start
        +
        " ～ "
        +
        end
    );

}


function isSameDate(
    a,
    b
) {

    return (

        a.getFullYear()
        ===
        b.getFullYear()

        &&

        a.getMonth()
        ===
        b.getMonth()

        &&

        a.getDate()
        ===
        b.getDate()

    );

}


function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}


/* ============================================================
   モーダルを閉じる
============================================================ */

function closeAllModals() {

    document
        .querySelectorAll(
            ".modal-background"
        )
        .forEach(
            modal => {

                modal.classList.remove(
                    "show"
                );

            }
        );


    currentGroupId = null;

    editingEntryId = null;

}