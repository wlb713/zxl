// Supabase配置
const supabaseUrl = 'https://ormudhlgljtcecgtyemb.supabase.co';
const supabaseKey = 'sb_publishable_MIbG2OYE0abbbK2tfYnklw_v8BEa-QN';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 管理员密码
const ADMIN_PASSWORD = 'admin123456';

// 初始化函数
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    // 日期筛选变化
    document.getElementById('dateFilter').addEventListener('change', function() {
        const customRange = document.getElementById('customDateRange');
        customRange.style.display = this.value === 'custom' ? 'block' : 'none';
    });

    // 设置默认日期
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('endDate').value = today;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    document.getElementById('startDate').value = oneWeekAgo.toISOString().split('T')[0];
}

// 身份验证
function authenticate() {
    const password = document.getElementById('password').value;
    const authBtn = document.getElementById('authBtn');
    const messageDiv = document.getElementById('message');

    if (password === ADMIN_PASSWORD) {
        // 验证成功
        document.querySelector('.auth-section').style.display = 'none';
        document.getElementById('exportSection').style.display = 'block';
        showMessage('身份验证成功！', 'success');
        loadDataSummary();
    } else {
        showMessage('密码错误，请重新输入！', 'error');
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }
}

// 加载数据统计
async function loadDataSummary() {
    try {
        const { data, error } = await supabase
            .from('registrations')
            .select('*');

        if (error) throw error;

        const summary = {
            total: data.length,
            byGrade: {},
            bySchool: {},
            byProvince: {}
        };

        data.forEach(item => {
            // 按年级统计
            summary.byGrade[item.grade] = (summary.byGrade[item.grade] || 0) + 1;
            
            // 按学校统计（前10名）
            summary.bySchool[item.school] = (summary.bySchool[item.school] || 0) + 1;
            
            // 按省份统计
            summary.byProvince[item.province] = (summary.byProvince[item.province] || 0) + 1;
        });

        displaySummary(summary);
        
    } catch (error) {
        console.error('Error loading data summary:', error);
        showMessage('加载数据统计失败: ' + error.message, 'error');
    }
}

// 显示数据统计
function displaySummary(summary) {
    const summaryContent = document.getElementById('summaryContent');
    let html = `
        <p><strong>总报名人数:</strong> ${summary.total}</p>
        <div class="summary-grid">
            <div class="summary-item">
                <h4>年级分布</h4>
                <ul>
    `;

    // 年级分布
    for (const [grade, count] of Object.entries(summary.byGrade)) {
        html += `<li>${grade}: ${count}人 (${((count / summary.total) * 100).toFixed(1)}%)</li>`;
    }

    html += `
                </ul>
            </div>
            <div class="summary-item">
                <h4>热门学校 (前5)</h4>
                <ul>
    `;

    // 热门学校
    const topSchools = Object.entries(summary.bySchool)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    topSchools.forEach(([school, count]) => {
        html += `<li>${school}: ${count}人</li>`;
    });

    html += `
                </ul>
            </div>
            <div class="summary-item">
                <h4>地区分布 (前5)</h4>
                <ul>
    `;

    // 地区分布
    const topProvinces = Object.entries(summary.byProvince)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    topProvinces.forEach(([province, count]) => {
        html += `<li>${province}: ${count}人</li>`;
    });

    html += `
                </ul>
            </div>
        </div>
    `;

    summaryContent.innerHTML = html;
    document.getElementById('dataSummary').style.display = 'block';
}

// 导出数据
async function exportData() {
    const exportBtn = document.getElementById('exportBtn');
    const messageDiv = document.getElementById('message');
    
    try {
        exportBtn.disabled = true;
        exportBtn.textContent = '导出中...';
        
        // 获取筛选条件
        const dateFilter = document.getElementById('dateFilter').value;
        let startDate, endDate;
        
        if (dateFilter === 'custom') {
            startDate = document.getElementById('startDate').value;
            endDate = document.getElementById('endDate').value;
        } else {
            const dateRange = getDateRange(dateFilter);
            startDate = dateRange.start;
            endDate = dateRange.end;
        }

        // 构建查询
        let query = supabase.from('registrations').select('*');
        
        if (dateFilter !== 'all') {
            query = query.gte('created_at', startDate + 'T00:00:00Z')
                        .lte('created_at', endDate + 'T23:59:59Z');
        }

        const { data, error } = await query;
        
        if (error) throw error;

        if (data.length === 0) {
            showMessage('没有找到符合条件的数据！', 'error');
            return;
        }

        // 处理导出格式
        const exportFormats = [];
        if (document.getElementById('exportExcel').checked) exportFormats.push('excel');
        if (document.getElementById('exportCSV').checked) exportFormats.push('csv');
        if (document.getElementById('exportJSON').checked) exportFormats.push('json');

        for (const format of exportFormats) {
            await exportToFormat(data, format, startDate, endDate);
        }

        showMessage(`数据导出成功！共导出 ${data.length} 条记录。`, 'success');

    } catch (error) {
        console.error('Error exporting data:', error);
        showMessage('导出失败: ' + error.message, 'error');
    } finally {
        exportBtn.disabled = false;
        exportBtn.textContent = '导出数据';
    }
}

// 获取日期范围
function getDateRange(filter) {
    const end = new Date();
    const start = new Date();
    
    switch (filter) {
        case 'today':
            start.setHours(0, 0, 0, 0);
            break;
        case 'week':
            start.setDate(start.getDate() - 7);
            break;
        case 'month':
            start.setMonth(start.getMonth() - 1);
            break;
        default:
            return { start: null, end: null };
    }
    
    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    };
}

// 导出为指定格式
function exportToFormat(data, format, startDate, endDate) {
    const timestamp = new Date().toISOString().split('T')[0];
    let dateSuffix = '';
    
    if (startDate && endDate) {
        dateSuffix = `_${startDate}_至_${endDate}`;
    }
    
    const filename = `报名数据${dateSuffix}_${timestamp}`;
    
    switch (format) {
        case 'excel':
            return exportToExcel(data, filename);
        case 'csv':
            return exportToCSV(data, filename);
        case 'json':
            return exportToJSON(data, filename);
    }
}

// 导出为Excel
function exportToExcel(data, filename) {
    // 准备工作表数据
    const wsData = data.map(item => ({
        'ID': item.id,
        '学校': item.school,
        '年级': item.grade,
        '班级': item.class,
        '学生姓名': item.student_name,
        '省份': item.province,
        '城市': item.city,
        '区县': item.district,
        '详细地址': item.detailed_address,
        '教材': item.textbooks,
        '联系电话': item.phone,
        '报名时间': new Date(item.created_at).toLocaleString('zh-CN')
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '报名数据');
    
    // 设置列宽
    const colWidths = [
        { wch: 8 },  // ID
        { wch: 20 }, // 学校
        { wch: 8 },  // 年级
        { wch: 10 }, // 班级
        { wch: 12 }, // 学生姓名
        { wch: 10 }, // 省份
        { wch: 10 }, // 城市
        { wch: 10 }, // 区县
        { wch: 25 }, // 详细地址
        { wch: 20 }, // 教材
        { wch: 15 }, // 联系电话
        { wch: 20 }  // 报名时间
    ];
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

// 导出为CSV
function exportToCSV(data, filename) {
    const headers = ['ID', '学校', '年级', '班级', '学生姓名', '省份', '城市', '区县', '详细地址', '教材', '联系电话', '报名时间'];
    
    const csvContent = [
        headers.join(','),
        ...data.map(item => [
            item.id,
            `"${item.school}"`,
            `"${item.grade}"`,
            `"${item.class}"`,
            `"${item.student_name}"`,
            `"${item.province}"`,
            `"${item.city}"`,
            `"${item.district}"`,
            `"${item.detailed_address}"`,
            `"${item.textbooks}"`,
            `"${item.phone}"`,
            `"${new Date(item.created_at).toLocaleString('zh-CN')}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
}

// 导出为JSON
function exportToJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
}

// 显示消息
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}
