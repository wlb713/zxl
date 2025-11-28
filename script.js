// Supabase配置
const supabaseUrl = 'https://ormudhlgljtcecgtyemb.supabase.co';
const supabaseKey = 'sb_publishable_MIbG2OYE0abbbK2tfYnklw_v8BEa-QN';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 初始化函数
document.addEventListener('DOMContentLoaded', function() {
    initializeSchoolDropdown();
    initializeRegionDropdowns();
    setupEventListeners();
});

// 初始化学校下拉菜单
async function initializeSchoolDropdown() {
    const schoolSelect = document.getElementById('school');
    
    // 基于搜索结果的重庆学校列表
    const chongqingSchools = [
        "重庆南开中学", "重庆巴蜀中学", "重庆一中", "重庆八中", "重庆育才中学", 
        "西南师大附中", "重庆巴县中学", "重庆合川中学", "重庆市第十一中学校",
        "重庆第二外国语学校", "重庆市广益中学校", "重庆市南坪中学校", "辅仁中学",
        "重庆南开（融侨）中学", "重庆珊瑚初级中学", "重庆市第一一0中学校",
        "重庆市綦江南州中学校", "重庆市綦江区打通中学", "重庆市綦江区东溪中学",
        "重庆市綦江区三江中学", "重庆市綦江实验中学校", "重庆市綦江中学",
        "重庆市万州纯阳中学校", "重庆市万州赛德中学校", "重庆市涪陵外国语学校",
        "重庆市江南艺术中学校", "重庆市大足城南中学校", "重庆大足迪涛学校",
        "重庆德普外国语学校", "重庆史迪威外语学校", "重庆巴南育才实验中学校",
        "重庆市国维外国语学校", "重庆远恒佳学校", "重庆枫叶国际学校",
        "重庆市巴川国际高级中学校", "重庆市荣昌区大成中学校", "开州区私立敬业中学",
        "重庆市梁平第一中学校", "重庆市丰都县同文学校", "重庆市中山外国语学校",
        "重庆市为明学校", "重庆巴蜀常春藤学校", "重庆市巴渝学校",
        "重庆市江津区京师实验中学校", "重庆市江北巴川量子学校", "重庆市高新区东川高级中学校"
    ];
    
    // 添加学校选项
    chongqingSchools.forEach(school => {
        const option = document.createElement('option');
        option.value = school;
        option.textContent = school;
        schoolSelect.appendChild(option);
    });
    
    // 添加"其他"选项
    const otherOption = document.createElement('option');
    otherOption.value = "other";
    otherOption.textContent = "其他学校";
    schoolSelect.appendChild(otherOption);
}

// 初始化省市区下拉菜单
function initializeRegionDropdowns() {
    // 基于搜索结果的省份列表
    const provinces = [
        "北京市", "天津市", "河北省", "山西省", "内蒙古自治区", "辽宁省", 
        "吉林省", "黑龙江省", "上海市", "江苏省", "浙江省", "安徽省", 
        "福建省", "江西省", "山东省", "河南省", "湖北省", "湖南省", 
        "广东省", "广西壮族自治区", "海南省", "重庆市", "四川省", 
        "贵州省", "云南省", "西藏自治区", "陕西省", "甘肃省", 
        "青海省", "宁夏回族自治区", "新疆维吾尔自治区", "香港特别行政区", 
        "澳门特别行政区", "台湾省"
    ];
    
    const provinceSelect = document.getElementById('province');
    provinces.forEach(province => {
        const option = document.createElement('option');
        option.value = province;
        option.textContent = province;
        provinceSelect.appendChild(option);
    });
    
    // 初始化城市和区县为空的
    updateCityDropdown();
    updateDistrictDropdown();
}

// 更新城市下拉菜单
function updateCityDropdown() {
    const province = document.getElementById('province').value;
    const citySelect = document.getElementById('city');
    
    // 清空现有选项
    citySelect.innerHTML = '<option value="">请选择城市</option>';
    
    if (!province) return;
    
    // 根据省份添加城市 - 这里简化处理，实际应用中需要完整的省市数据
    let cities = [];
    
    // 示例：如果选择重庆市，添加重庆的区县作为城市选项
    if (province === "重庆市") {
        cities = [
            "万州区", "涪陵区", "渝中区", "大渡口区", "江北区", "沙坪坝区", 
            "九龙坡区", "南岸区", "北碚区", "綦江区", "大足区", "渝北区", 
            "巴南区", "黔江区", "长寿区", "江津区", "合川区", "永川区", 
            "南川区", "璧山区", "铜梁区", "潼南区", "荣昌区", "开州区", 
            "梁平区", "武隆区", "城口县", "丰都县", "垫江县", "忠县", 
            "云阳县", "奉节县", "巫山县", "巫溪县", "石柱土家族自治县", 
            "秀山土家族苗族自治县", "酉阳土家族苗族自治县", "彭水苗族土家族自治县"
        ];
    } else {
        // 其他省份可以添加相应的城市数据
        cities = ["请先选择省份"];
    }
    
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
}

// 更新区县下拉菜单
function updateDistrictDropdown() {
    const city = document.getElementById('city').value;
    const districtSelect = document.getElementById('district');
    
    // 清空现有选项
    districtSelect.innerHTML = '<option value="">请选择区县</option>';
    
    if (!city) return;
    
    // 这里简化处理，实际应用中需要完整的区县数据
    // 对于重庆的区，区县和城市是同一级别
    let districts = [];
    
    // 如果是重庆的区，则区县选项为空（因为重庆的区已经是二级行政区）
    if (city.includes("区") || city.includes("县")) {
        districts = [city]; // 区县和城市相同
    } else {
        districts = ["请先选择城市"];
    }
    
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 学校选择变化
    document.getElementById('school').addEventListener('change', function() {
        const schoolOther = document.getElementById('schoolOther');
        schoolOther.style.display = this.value === 'other' ? 'block' : 'none';
    });
    
    // 年级选择变化
    document.getElementById('grade').addEventListener('change', updateTextbookOptions);
    
    // 省份选择变化
    document.getElementById('province').addEventListener('change', updateCityDropdown);
    
    // 城市选择变化
    document.getElementById('city').addEventListener('change', updateDistrictDropdown);
    
    // 图片预览
    document.getElementById('paymentScreenshot').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('imagePreview');
                preview.innerHTML = `<img src="${e.target.result}" alt="付款截图预览">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 表单提交
    document.getElementById('registrationForm').addEventListener('submit', handleFormSubmit);
}

// 更新教材选项
function updateTextbookOptions() {
    const grade = document.getElementById('grade').value;
    const textbookOptions = document.getElementById('textbookOptions');
    
    if (!grade) {
        textbookOptions.innerHTML = '<p class="hint">请先选择年级</p>';
        return;
    }
    
    let textbooks = [];
    
    switch(grade) {
        case '初一':
            textbooks = ['数学', '英语'];
            break;
        case '初二':
            textbooks = ['数学', '英语', '物理'];
            break;
        case '初三':
            textbooks = ['数学', '英语', '物理', '化学'];
            break;
    }
    
    let html = '<div class="checkbox-group">';
    textbooks.forEach(book => {
        html += `
            <div class="checkbox-item">
                <input type="checkbox" id="textbook_${book}" name="textbooks" value="${book}">
                <label for="textbook_${book}">${book}</label>
            </div>
        `;
    });
    html += '</div>';
    
    textbookOptions.innerHTML = html;
}

// 处理表单提交
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');
    
    // 禁用提交按钮防止重复提交
    submitBtn.disabled = true;
    submitBtn.textContent = '提交中...';
    
    try {
        // 收集表单数据
        const formData = new FormData(e.target);
        const school = formData.get('school') === 'other' ? formData.get('schoolOther') : formData.get('school');
        const grade = formData.get('grade');
        const studentClass = formData.get('class');
        const studentName = formData.get('studentName');
        const province = formData.get('province');
        const city = formData.get('city');
        const district = formData.get('district');
        const detailedAddress = formData.get('detailedAddress');
        const phone = formData.get('phone');
        const paymentScreenshot = document.getElementById('paymentScreenshot').files[0];
        
        // 获取选中的教材
        const textbookCheckboxes = document.querySelectorAll('input[name="textbooks"]:checked');
        const textbooks = Array.from(textbookCheckboxes).map(cb => cb.value);
        
        if (textbooks.length === 0) {
            throw new Error('请至少选择一本教材');
        }
        
        // 上传图片到Supabase存储
        let screenshotUrl = '';
        if (paymentScreenshot) {
            const fileExt = paymentScreenshot.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            
            const { data, error } = await supabase.storage
                .from('payment-screenshots')
                .upload(fileName, paymentScreenshot);
                
            if (error) throw error;
            
            // 获取公共URL
            const { data: urlData } = supabase.storage
                .from('payment-screenshots')
                .getPublicUrl(fileName);
                
            screenshotUrl = urlData.publicUrl;
        }
        
        // 插入数据到Supabase
        const { data, error } = await supabase
            .from('registrations')
            .insert([
                {
                    school,
                    grade,
                    class: studentClass,
                    student_name: studentName,
                    province,
                    city,
                    district,
                    detailed_address: detailedAddress,
                    textbooks: textbooks.join(', '),
                    phone,
                    payment_screenshot: screenshotUrl,
                    created_at: new Date().toISOString()
                }
            ]);
            
        if (error) throw error;
        
        // 显示成功消息
        showMessage('报名信息提交成功！', 'success');
        document.getElementById('registrationForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('textbookOptions').innerHTML = '<p class="hint">请先选择年级</p>';
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showMessage(`提交失败: ${error.message}`, 'error');
    } finally {
        // 重新启用提交按钮
        submitBtn.disabled = false;
        submitBtn.textContent = '提交报名信息';
    }
}

// 显示消息
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // 3秒后自动隐藏消息
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}
