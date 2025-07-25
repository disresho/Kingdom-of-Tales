let bestWorks = [];
let featuredIndex = 0;
let allData = [];

// دالة لتحديد عدد العناصر لكل صفحة حسب نوع الجهاز
function getItemsPerPage() {
    return window.innerWidth >= 1024 ? 7 : 4; // 7 للـ PC، 4 للجوال
}
let itemsPerPage = getItemsPerPage();

// إعادة تحديد عدد العناصر عند تغيير حجم الشاشة
window.addEventListener('resize', () => {
    const newItemsPerPage = getItemsPerPage();
    if (newItemsPerPage !== itemsPerPage) {
        itemsPerPage = newItemsPerPage;

        // تحديث عرض قسم الكل
        displayCards("all-content", allData.slice(0, itemsPerPage));
        setupPagination(allData, itemsPerPage);

        // تحديث عرض قسم الأكثر مشاهدة
        const sorted = [...allData].sort((a, b) => b.views - a.views);
        displayCards("most-viewed", sorted.slice(0, itemsPerPage));
        setupPaginationMostViewed(sorted, itemsPerPage);
    }
});

fetch("wp-content/uploads/data/data.json")
    .then(res => res.json())
    .then(data => {
        allData = data; // حفظ البيانات الأصلية للبحث

        bestWorks = data.filter(item => item.best === "yes");

        if (bestWorks.length) {
            displayFeaturedCard(featuredIndex);

            document.getElementById("prev-btn").onclick = () => {
                featuredIndex = (featuredIndex - 1 + bestWorks.length) % bestWorks.length;
                displayFeaturedCard(featuredIndex);
            };

            document.getElementById("next-btn").onclick = () => {
                featuredIndex = (featuredIndex + 1) % bestWorks.length;
                displayFeaturedCard(featuredIndex);
            };
        }

        // عرض الأكثر مشاهدة حسب الجهاز
        const sorted = [...data].sort((a, b) => b.views - a.views);
        displayCards("most-viewed", sorted.slice(0, itemsPerPage));
        setupPaginationMostViewed(sorted, itemsPerPage);

        // عرض قسم الكل حسب الجهاز
        displayCards("all-content", data.slice(0, itemsPerPage));
        setupPagination(data, itemsPerPage);
    })
    .catch(err => {
        console.error("خطأ في تحميل البيانات:", err);
    });


function displayFeaturedCard(index) {
    const featured = document.getElementById("featured-card");
    const item = bestWorks[index];
    featured.innerHTML = `
    <div>
      <img src="${item.cover}" alt="${item.name}"/>
        <div class="work-name">${item.name}</div>
    </div>
  `;
    featured.onclick = () => window.location.href = `view.html?id=${item.id}`;
}

function displayCards(containerId, items) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.onclick = () => window.location.href = `view.html?id=${item.id}`;
        card.innerHTML = `
      <div>
        <img src="${item.cover}" alt="${item.name}" />
        <div class="work-name-s">${item.name}</div>
      </div>
    `;
        container.appendChild(card);
    });
}

// ترقيم لقسم "الكل"
function setupPagination(data, perPage) {
    const totalPages = Math.ceil(data.length / perPage);
    const pagination = document.getElementById("main-pagination");
    pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.onclick = () => {
            const slice = data.slice((i - 1) * perPage, i * perPage);
            displayCards("all-content", slice);
        };
        pagination.appendChild(btn);
    }
}

// ترقيم لقسم "الأكثر مشاهدة"
function setupPaginationMostViewed(sortedData, perPage) {
    const pagination = document.getElementById("most-viewed-pagination");
    if (!pagination) return; // إذا لم يتم وضع العنصر بالـ HTML
    const totalPages = Math.ceil(sortedData.length / perPage);
    pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.onclick = () => {
            const slice = sortedData.slice((i - 1) * perPage, i * perPage);
            displayCards("most-viewed", slice);
        };
        pagination.appendChild(btn);
    }
}

// بحث مباشر أثناء الكتابة (بدون زر)
document.getElementById("search-input").addEventListener("input", () => {
    const query = document.getElementById("search-input").value.trim().toLowerCase();

    const featuredSection = document.querySelector(".featured-section");
    const mostViewedSection = document.querySelector("#most-viewed");
    const pagination = document.getElementById("main-pagination");

    if (query === "") {
        // إعادة عرض كل الأقسام إذا حقل البحث فارغ
        featuredSection.style.display = "flex";
        mostViewedSection.parentElement.style.display = "block";
        pagination.style.display = "block";

        displayCards("all-content", allData.slice(0, 3));
        setupPagination(allData, 3);
        return;
    }

    // إخفاء الأقسام الأخرى أثناء البحث
    featuredSection.style.display = "none";
    mostViewedSection.parentElement.style.display = "none";
    pagination.style.display = "none";

    // عرض نتائج البحث فقط
    const results = allData.filter(item =>
        item.name.toLowerCase().includes(query)
    );
    displayCards("all-content", results);
});