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
        console.log('开始加载数据统计...');
        const { data, error } = await supabase
            .from('registrations')
            .select('*');

        if (error) throw error;

        console.log('数据统计查询结果:', data);

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
        console.log('=== 开始数据导出调试 ===');
        
        exportBtn.disabled = true;
        exportBtn.textContent = '导出中...';
        
        // 直接查询所有数据，不添加任何筛选条件
        console.log('执行数据查询...');
        const { data, error } = await supabase
            .from('registrations')
            .select('*');
            
        console.log('查询结果:', data);
        console.log('查询错误:', error);
        
        if (error) {
            console.error('查询错误详情:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            showMessage('数据库中没有任何报名数据！', 'error');
            exportBtn.disabled = false;
            exportBtn.textContent = '导出数据';
            return;
        }

        console.log(`找到 ${data.length} 条数据，开始导出...`);
        
        // 处理导出格式
        const exportFormats = [];
        if (document.getElementById('exportExcel').checked) exportFormats.push('excel');
        if (document.getElementById('exportCSV').checked) exportFormats.push('csv');
        if (document.getElementById('exportJSON').checked) exportFormats.push('json');

        if (exportFormats.length === 0) {
            showMessage('请至少选择一种导出格式！', 'error');
            exportBtn.disabled = false;
            exportBtn.textContent = '导出数据';
            return;
        }

        // 获取日期信息用于文件名
        const dateFilter = document.getElementById('dateFilter').value;
        let startDate, endDate;
        
        if (dateFilter === 'custom') {
            startDate = document.getElementById('startDate').value;
            endDate = document.getElementById('endDate').value;
        } else if (dateFilter !== 'all') {
            const dateRange = getDateRange(dateFilter);
            startDate = dateRange.start;
            endDate = dateRange.end;
        }

        // 执行导出
        for (const format of exportFormats) {
            await exportToFormat(data, format, startDate, endDate);
        }

        showMessage(`数据导出成功！共导出 ${data.length} 条记录。`, 'success');
        console.log('导出完成');

    } catch (error) {
        console.error('导出过程错误:', error);
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
    try {
        const timestamp = new Date().toISOString().split('T')[0];
        let dateSuffix = '';
        
        if (startDate && endDate) {
            dateSuffix = `_${startDate}_至_${endDate}`;
        }
        
        const filename = `报名数据${dateSuffix}_${timestamp}`;
        
        console.log(`导出为 ${format} 格式，文件名: ${filename}`);
        console.log('导出数据样例:', data[0]);
        
        switch (format) {
            case 'excel':
                return exportToExcel(data, filename);
            case 'csv':
                return exportToCSV(data, filename);
            case 'json':
                return exportToJSON(data, filename);
        }
    } catch (error) {
        console.error(`导出 ${format} 格式时出错:`, error);
        throw error;
    }
}

// 导出为Excel
function exportToExcel(data, filename) {
    try {
        console.log('开始导出Excel，数据量:', data.length);
        
        // 准备工作表数据 - 确保字段名匹配数据库
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
            '报名时间': new Date(item.created_at).toLocaleString('zh-CN'),
            '付款截图': item.payment_screenshot || '无'
        }));

        console.log('Excel数据准备完成:', wsData[0]);

        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '报名数据');
        
        // 设置列宽
        const colWidths = [
            { wch: 8 },   // ID
            { wch: 25 },  // 学校
            { wch: 8 },   // 年级
            { wch: 10 },  // 班级
            { wch: 12 },  // 学生姓名
            { wch: 12 },  // 省份
            { wch: 12 },  // 城市
            { wch: 12 },  // 区县
            { wch: 30 },  // 详细地址
            { wch: 20 },  // 教材
            { wch: 15 },  // 联系电话
            { wch: 20 },  // 报名时间
            { wch: 30 }   // 付款截图
        ];
        ws['!cols'] = colWidths;
        
        XLSX.writeFile(wb, `${filename}.xlsx`);
        console.log('Excel导出完成');
        
    } catch (error) {
        console.error('Excel导出错误:', error);
        throw new Error('Excel导出失败: ' + error.message);
    }
}

// 导出为CSV
function exportToCSV(data, filename) {
    try {
        console.log('开始导出CSV，数据量:', data.length);
        
        const headers = ['ID', '学校', '年级', '班级', '学生姓名', '省份', '城市', '区县', '详细地址', '教材', '联系电话', '报名时间', '付款截图'];
        
        const csvData = data.map(item => [
            item.id,
            `"${item.school || ''}"`,
            `"${item.grade || ''}"`,
            `"${item.class || ''}"`,
            `"${item.student_name || ''}"`,
            `"${item.province || ''}"`,
            `"${item.city || ''}"`,
            `"${item.district || ''}"`,
            `"${item.detailed_address || ''}"`,
            `"${item.textbooks || ''}"`,
            `"${item.phone || ''}"`,
            `"${new Date(item.created_at).toLocaleString('zh-CN')}"`,
            `"${item.payment_screenshot || '无'}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
        
        console.log('CSV导出完成');
        
    } catch (error) {
        console.error('CSV导出错误:', error);
        throw new Error('CSV导出失败: ' + error.message);
    }
}

// 导出为JSON
function exportToJSON(data, filename) {
    try {
        console.log('开始导出JSON，数据量:', data.length);
        
        // 格式化数据，包含所有字段
        const jsonData = data.map(item => ({
            id: item.id,
            school: item.school,
            grade: item.grade,
            class: item.class,
            student_name: item.student_name,
            province: item.province,
            city: item.city,
            district: item.district,
            detailed_address: item.detailed_address,
            textbooks: item.textbooks,
            phone: item.phone,
            created_at: item.created_at,
            payment_screenshot: item.payment_screenshot
        }));

        const jsonContent = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.json`;
        link.click();
        
        console.log('JSON导出完成');
        
    } catch (error) {
        console.error('JSON导出错误:', error);
        throw new Error('JSON导出失败: ' + error.message);
    }
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
