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
    
    // 根据省份添加城市
    let cities = [];
    
    // 直辖市处理
    if (["北京市", "天津市", "上海市", "重庆市"].includes(province)) {
        // 直辖市，城市选项为区
        if (province === "北京市") {
            cities = [
                "东城区", "西城区", "朝阳区", "丰台区", "石景山区", "海淀区",
                "门头沟区", "房山区", "通州区", "顺义区", "昌平区", "大兴区",
                "怀柔区", "平谷区", "密云区", "延庆区"
            ];
        } else if (province === "天津市") {
            cities = [
                "和平区", "河东区", "河西区", "南开区", "河北区", "红桥区",
                "东丽区", "西青区", "津南区", "北辰区", "武清区", "宝坻区",
                "滨海新区", "宁河区", "静海区", "蓟州区"
            ];
        } else if (province === "上海市") {
            cities = [
                "黄浦区", "徐汇区", "长宁区", "静安区", "普陀区", "虹口区",
                "杨浦区", "闵行区", "宝山区", "嘉定区", "浦东新区", "金山区",
                "松江区", "青浦区", "奉贤区", "崇明区"
            ];
        } else if (province === "重庆市") {
            cities = [
                "万州区", "涪陵区", "渝中区", "大渡口区", "江北区", "沙坪坝区", 
                "九龙坡区", "南岸区", "北碚区", "綦江区", "大足区", "渝北区", 
                "巴南区", "黔江区", "长寿区", "江津区", "合川区", "永川区", 
                "南川区", "璧山区", "铜梁区", "潼南区", "荣昌区", "开州区", 
                "梁平区", "武隆区", "城口县", "丰都县", "垫江县", "忠县", 
                "云阳县", "奉节县", "巫山县", "巫溪县", "石柱土家族自治县", 
                "秀山土家族苗族自治县", "酉阳土家族苗族自治县", "彭水苗族土家族自治县"
            ];
        }
    } else {
        // 其他省份的主要城市
        switch(province) {
            case "河北省":
                cities = ["石家庄市", "唐山市", "秦皇岛市", "邯郸市", "邢台市", "保定市", "张家口市", "承德市", "沧州市", "廊坊市", "衡水市"];
                break;
            case "山西省":
                cities = ["太原市", "大同市", "阳泉市", "长治市", "晋城市", "朔州市", "晋中市", "运城市", "忻州市", "临汾市", "吕梁市"];
                break;
            case "江苏省":
                cities = ["南京市", "无锡市", "徐州市", "常州市", "苏州市", "南通市", "连云港市", "淮安市", "盐城市", "扬州市", "镇江市", "泰州市", "宿迁市"];
                break;
            case "浙江省":
                cities = ["杭州市", "宁波市", "温州市", "嘉兴市", "湖州市", "绍兴市", "金华市", "衢州市", "舟山市", "台州市", "丽水市"];
                break;
            case "安徽省":
                cities = ["合肥市", "芜湖市", "蚌埠市", "淮南市", "马鞍山市", "淮北市", "铜陵市", "安庆市", "黄山市", "滁州市", "阜阳市", "宿州市", "六安市", "亳州市", "池州市", "宣城市"];
                break;
            case "福建省":
                cities = ["福州市", "厦门市", "莆田市", "三明市", "泉州市", "漳州市", "南平市", "龙岩市", "宁德市"];
                break;
            case "江西省":
                cities = ["南昌市", "景德镇市", "萍乡市", "九江市", "新余市", "鹰潭市", "赣州市", "吉安市", "宜春市", "抚州市", "上饶市"];
                break;
            case "山东省":
                cities = ["济南市", "青岛市", "淄博市", "枣庄市", "东营市", "烟台市", "潍坊市", "济宁市", "泰安市", "威海市", "日照市", "临沂市", "德州市", "聊城市", "滨州市", "菏泽市"];
                break;
            case "河南省":
                cities = ["郑州市", "开封市", "洛阳市", "平顶山市", "安阳市", "鹤壁市", "新乡市", "焦作市", "濮阳市", "许昌市", "漯河市", "三门峡市", "南阳市", "商丘市", "信阳市", "周口市", "驻马店市"];
                break;
            case "湖北省":
                cities = ["武汉市", "黄石市", "十堰市", "宜昌市", "襄阳市", "鄂州市", "荆门市", "孝感市", "荆州市", "黄冈市", "咸宁市", "随州市", "恩施土家族苗族自治州"];
                break;
            case "湖南省":
                cities = ["长沙市", "株洲市", "湘潭市", "衡阳市", "邵阳市", "岳阳市", "常德市", "张家界市", "益阳市", "郴州市", "永州市", "怀化市", "娄底市", "湘西土家族苗族自治州"];
                break;
            case "广东省":
                cities = ["广州市", "韶关市", "深圳市", "珠海市", "汕头市", "佛山市", "江门市", "湛江市", "茂名市", "肇庆市", "惠州市", "梅州市", "汕尾市", "河源市", "阳江市", "清远市", "东莞市", "中山市", "潮州市", "揭阳市", "云浮市"];
                break;
            case "四川省":
                cities = ["成都市", "自贡市", "攀枝花市", "泸州市", "德阳市", "绵阳市", "广元市", "遂宁市", "内江市", "乐山市", "南充市", "眉山市", "宜宾市", "广安市", "达州市", "雅安市", "巴中市", "资阳市", "阿坝藏族羌族自治州", "甘孜藏族自治州", "凉山彝族自治州"];
                break;
            case "陕西省":
                cities = ["西安市", "铜川市", "宝鸡市", "咸阳市", "渭南市", "延安市", "汉中市", "榆林市", "安康市", "商洛市"];
                break;
            default:
                cities = ["请先选择省份"];
        }
    }
    
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
    
    // 更新区县
    updateDistrictDropdown();
}

// 更新区县下拉菜单
function updateDistrictDropdown() {
    const province = document.getElementById('province').value;
    const city = document.getElementById('city').value;
    const districtSelect = document.getElementById('district');
    
    // 清空现有选项
    districtSelect.innerHTML = '<option value="">请选择区县</option>';
    
    if (!province || !city) return;
    
    let districts = [];
    
    // 直辖市处理 - 直辖市的城市选项已经是区，所以区县留空或设为相同
    if (["北京市", "天津市", "上海市", "重庆市"].includes(province)) {
        districts = [city]; // 区县和城市相同
    } else {
        // 其他省份的区县 - 这里简化处理，实际应用中需要完整的区县数据
        switch(city) {
            case "石家庄市":
                districts = ["长安区", "桥西区", "新华区", "井陉矿区", "裕华区", "藁城区", "鹿泉区", "栾城区", "井陉县", "正定县", "行唐县", "灵寿县", "高邑县", "深泽县", "赞皇县", "无极县", "平山县", "元氏县", "赵县", "晋州市", "新乐市"];
                break;
            case "南京市":
                districts = ["玄武区", "秦淮区", "建邺区", "鼓楼区", "浦口区", "栖霞区", "雨花台区", "江宁区", "六合区", "溧水区", "高淳区"];
                break;
            case "杭州市":
                districts = ["上城区", "下城区", "江干区", "拱墅区", "西湖区", "滨江区", "萧山区", "余杭区", "富阳区", "临安区", "桐庐县", "淳安县", "建德市"];
                break;
            case "广州市":
                districts = ["荔湾区", "越秀区", "海珠区", "天河区", "白云区", "黄埔区", "番禺区", "花都区", "南沙区", "从化区", "增城区"];
                break;
            case "成都市":
                districts = ["锦江区", "青羊区", "金牛区", "武侯区", "成华区", "龙泉驿区", "青白江区", "新都区", "温江区", "双流区", "郫都区", "金堂县", "大邑县", "蒲江县", "新津县", "都江堰市", "彭州市", "邛崃市", "崇州市", "简阳市"];
                break;
            case "西安市":
                districts = ["新城区", "碑林区", "莲湖区", "灞桥区", "未央区", "雁塔区", "阎良区", "临潼区", "长安区", "高陵区", "鄠邑区", "蓝田县", "周至县"];
                break;
            default:
                districts = [city]; // 默认使用城市名
        }
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
