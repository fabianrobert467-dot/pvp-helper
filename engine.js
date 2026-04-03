// 洛克王国 PVP 核心分析引擎
const RocoEngine = {
    // 1. 扫描技能描述，解析隐藏机制 (删PP、硬控、防控、换下传递)
    analyzeMechanics: function(pet) {
        let tags = new Set();
        if (!pet.skills) return [];

        pet.skills.forEach(skill => {
            const d = skill.desc || "";
            if (d.includes("换下") || d.includes("接力") || d.includes("下一只")) {
                tags.add("🔄 状态传递 (注意防范接力推队)");
            }
            if (d.includes("删除") && d.includes("PP")) {
                tags.add("🔥 删PP机制 (注意技能续航)");
            }
            if (d.includes("恐惧") || d.includes("冰冻") || d.includes("催眠") || d.includes("迷惑")) {
                tags.add("😵 强力硬控 (建议首发开出防控)");
            }
            if (d.includes("免疫") || d.includes("异常")) {
                tags.add("🛡️ 自带防控 (拥有免控能力)");
            }
            if (d.includes("必先") || parseInt(skill.priority) >= 4) {
                tags.add("⚡ 极高先手 (技能先手度 +4 及以上)");
            }
        });
        return Array.from(tags);
    },

    // 2. 模拟对局优势 (速度线博弈 & 胜率计算)
    calculateAdvantage: function(myPet, enemyPet) {
        // 速度判定
        const mySpeed = myPet.stats.speed;
        const enSpeed = enemyPet.stats.speed;
        const myMaxPrio = Math.max(...myPet.skills.map(s => parseInt(s.priority) || 0));
        const enMaxPrio = Math.max(...enemyPet.skills.map(s => parseInt(s.priority) || 0));

        let speedMsg = "";
        let speedAdv = 0; // 速度分

        if (myMaxPrio > enMaxPrio) {
            speedMsg = `<span style="color:#2ecc71;">✅ 我方绝对先手 (技能+${myMaxPrio} 压制 +${enMaxPrio})</span>`;
            speedAdv = 15;
        } else if (myMaxPrio < enMaxPrio) {
            speedMsg = `<span style="color:#e74c3c;">⚠️ 敌方绝对先手 (技能+${enMaxPrio} 压制 +${myMaxPrio})</span>`;
            speedAdv = -15;
        } else {
            if (mySpeed > enSpeed) {
                speedMsg = `<span style="color:#2ecc71;">✅ 我方速度面板占优 (${mySpeed} vs ${enSpeed})</span>`;
                speedAdv = 10;
            } else if (mySpeed < enSpeed) {
                speedMsg = `<span style="color:#e74c3c;">⚠️ 敌方速度面板占优 (${enSpeed} vs ${mySpeed})</span>`;
                speedAdv = -10;
            } else {
                speedMsg = `⚖️ 速度完全同等，拼随机乱数`;
            }
        }

        // 简易胜率计算 (攻防乘区 + 属性克制乘区 + 速度加权)
        let myAtk = Math.max(myPet.stats.atk, myPet.stats.sp_atk);
        let enDef = Math.max(enemyPet.stats.def, enemyPet.stats.sp_def);
        
        // 容错：如果找不到 config 中的克制倍率，默认为 1
        let multiplier = 1;
        if (typeof ROCO_CONFIG !== 'undefined') {
            const type1 = myPet.element.replace('系', '');
            const type2 = enemyPet.element.replace('系', '');
            multiplier = ROCO_CONFIG.getMultiplier(type1, type2);
        }
        
        let score = (myAtk / enDef) * multiplier;
        let winRate = 50;
        
        if (score > 1.5) winRate = 75;
        else if (score > 1.1) winRate = 60;
        else if (score < 0.8) winRate = 40;
        else if (score < 0.5) winRate = 25;

        winRate += speedAdv;
        winRate = Math.max(5, Math.min(95, winRate)); // 锁定在 5% 到 95% 之间

        return { speedMsg, winRate, multiplier };
    }
};
