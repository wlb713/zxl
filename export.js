// Supabase配置
const supabaseUrl = 'https://ormudhlgljtcecgtyemb.supabase.co';
const supabaseKey = 'sb_publishable_MIbG2OYE0abbbK2tfYnklw_v8BEa-QN';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 管理员密码
const ADMIN_PASSWORD = 'admin123456';

// 初始化函数
document.addEventListener('DOMContentLoaded', function() {
    console.log('导出页面初始化完成');
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
    
    console.log('事件监听器设置完成');
}

// 身份验证
function authenticate() {
    const password = document.getElementById('password').value;
    console.log('身份验证，输入密码:', password);

    if (password === ADMIN_PASSWORD) {
        // 验证成功
        document.querySelector('.auth-section').style.display = 'none';
        document.getElementById('exportSection').style.display = 'block';
        showMessage('身份验证成功！', 'success');
        console.log('身份验证成功');
        
        // 验证成功后立即加载数据统计
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
        
        // 查询所有数据用于统计
        const { data, error } = await supabase
            .from('registrations')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('统计查询错误:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            document.getElementById('dataSummary').style.display = 'none';
            return;
        }

        // 生成统计信息
        generateSummary(data);
        document.getElementById('dataSummary').style.display = 'block';
        
    } catch (error) {
        console.error('加载统计信息错误:', error);
    }
}

// 生成统计信息
function generateSummary(data) {
    // 按年级统计
    const gradeCount = {};
    // 按学校统计
    const schoolCount = {};
    // 按教材统计
    const textbookCount = {};
    // 按省份统计
    const provinceCount = {};

    data.forEach(item => {
        // 年级统计
        gradeCount[item.grade] = (gradeCount[item.grade] || 0) + 1;
        
        // 学校统计
        schoolCount[item.school] = (schoolCount[item.school] || 0) + 1;
        
        // 教材统计
        if (item.textbooks) {
            const textbooks = item.textbooks.split(', ');
            textbooks.forEach(book => {
                textbookCount[book] = (textbookCount[book] || 0) + 1;
            });
        }
        
        // 省份统计
        provinceCount[item.province] = (provinceCount[item.province] || 0) + 1;
    });

    let summaryHtml = `
        <div class="summary-grid">
            <div class="summary-item">
                <h4>总报名人数</h4>
                <p style="font-size: 24px; font-weight: bold; color: #3498db; text-align: center;">${data.length}</p>
            </div>
            <div class="summary-item">
                <h4>按年级统计</h4>
                <ul>
                    ${Object.entries(gradeCount).map(([grade, count]) => 
                        `<li>${grade}: ${count}人</li>`
                    ).join('')}
                </ul>
            </div>
            <div class="summary-item">
                <h4>按教材统计</h4>
                <ul>
                    ${Object.entries(textbookCount).map(([book, count]) => 
                        `<li>${book}: ${count}人</li>`
                    ).join('')}
                </ul>
            </div>
            <div class="summary-item">
                <h4>热门学校 (前5)</h4>
                <ul>
                    ${Object.entries(schoolCount)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([school, count]) => 
                            `<li>${school}: ${count}人</li>`
                        ).join('')}
                </ul>
            </div>
        </div>
    `;

    document.getElementById('summaryContent').innerHTML = summaryHtml;
}

// 导出数据
async function exportData() {
    const exportBtn = document.getElementById('exportBtn');
    
    try {
        console.log('=== 开始数据导出 ===');
        
        exportBtn.disabled = true;
        exportBtn.textContent = '导出中...';
        
        // 获取日期筛选条件
        const dateFilter = document.getElementById('dateFilter').value;
        let startDate, endDate;
        
        if (dateFilter === 'custom') {
            startDate = document.getElementById('startDate').value;
            endDate = document.getElementById('endDate').value;
            if (!startDate || !endDate) {
                showMessage('请选择完整的自定义日期范围！', 'error');
                exportBtn.disabled = false;
                exportBtn.textContent = '导出数据';
                return;
            }
        } else if (dateFilter !== 'all') {
            const dateRange = getDateRange(dateFilter);
            startDate = dateRange.start;
            endDate = dateRange.end;
        }

        console.log('日期筛选条件:', { dateFilter, startDate, endDate });

        // 构建查询
        let query = supabase.from('registrations').select('*');
        
        // 添加日期筛选
        if (dateFilter !== 'all' && startDate && endDate) {
            console.log('应用日期筛选');
            // 修正日期格式，确保包含时间部分
            const startDateTime = startDate + 'T00:00:00.000Z';
            const endDateTime = endDate + 'T23:59:59.999Z';
            
            console.log('查询时间范围:', startDateTime, '至', endDateTime);
            
            query = query.gte('created_at', startDateTime)
                        .lte('created_at', endDateTime);
        } else {
            console.log('查询所有数据');
        }

        // 执行查询
        console.log('执行数据查询...');
        const { data, error } = await query;
            
        console.log('查询结果:', {
            dataLength: data ? data.length : 0,
            error: error
        });
        
        if (error) {
            console.error('查询错误:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.log('没有找到符合条件的数据');
            let message = '没有找到符合条件的数据！';
            if (dateFilter !== 'all') {
                message += ` 日期范围: ${startDate} 至 ${endDate}`;
            }
            showMessage(message, 'error');
            exportBtn.disabled = false;
            exportBtn.textContent = '导出数据';
            return;
        }

        console.log(`找到 ${data.length} 条数据，开始导出Excel`);
        
        // 导出为Excel
        await exportToExcel(data, startDate, endDate);

        showMessage(`数据导出成功！共导出 ${data.length} 条记录。`, 'success');
        console.log('导出流程完成');

        // 更新统计信息
        generateSummary(data);

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

// 导出为Excel
function exportToExcel(data, startDate, endDate) {
    try {
        console.log('开始导出Excel，数据量:', data.length);
        
        // 生成文件名
        const timestamp = new Date().toISOString().split('T')[0];
        let filename = '报名数据';
        
        if (startDate && endDate) {
            filename += `_${startDate}_至_${endDate}`;
        }
        filename += `_${timestamp}.xlsx`;
        
        console.log('导出文件名:', filename);
        
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
            '报名时间': new Date(item.created_at).toLocaleString('zh-CN'),
            '付款截图': item.payment_screenshot || '无'
        }));

        console.log('Excel数据准备完成');

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
        
        XLSX.writeFile(wb, filename);
        console.log('Excel导出完成');
        
    } catch (error) {
        console.error('Excel导出错误:', error);
        throw new Error('Excel导出失败: ' + error.message);
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
