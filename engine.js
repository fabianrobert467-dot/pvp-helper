const RocoEngine = {
    // 1. 深度分析技能机制（从爬虫抓取的 desc 中提取关键词）
    analyzeMechanics: function(pet) {
        let advice = [];
        let threats = [];
        const skills = pet.skills || [];

        skills.forEach(s => {
            const d = s.desc || "";
            const n = s.name || "";
            
            // 扫描敌方威胁 (红色提示)
            if (d.includes("必先") || d.includes("先手")) threats.push(`${n}: 高先手补刀`);
            if (d.includes("删除") || d.includes("PP") || d.includes("删")) threats.push(`${n}: 削减续航(删PP)`);
            if (d.includes("控制") || d.includes("冰冻") || d.includes("恐惧") || d.includes("麻醉")) threats.push(`${n}: 强力异常控制`);
            if (d.includes("必中") || d.includes("必定命中")) threats.push(`${n}: 必中伤害`);
            if (d.includes("斩杀") || d.includes("生命值低于")) threats.push(`${n}: 低血量斩杀线`);

            // 扫描我方建议 (绿色提示)
            if (d.includes("恢复") || d.includes("回复") || d.includes("治疗")) advice.push(`利用 ${n} 持续回血`);
            if (d.includes("提升") || d.includes("强化") || d.includes("攻击+")) advice.push(`通过 ${n} 叠加数值压制`);
            if (d.includes("净化") || d.includes("免疫") || d.includes("异常")) advice.push(`预判对方控制，用 ${n} 顶掉`);
            if (d.includes("护盾") || d.includes("减伤")) advice.push(`开启 ${n} 吸收爆发伤害`);
        });

        // 去重并处理空数据
        return { 
            advice: advice.length ? [...new Set(advice)] : ["稳扎稳打，寻找机会"], 
            threats: threats.length ? [...new Set(threats)] : ["常规作战，无特殊机制威胁"] 
        };
    },

    // 2. 战术策略建议
    getStrategy: function(myPet, enPet) {
        const ms = myPet.stats.speed || 100;
        const es = enPet.stats.speed || 100;
        
        let moveOrder = ms > es ? 
            `⚡ 我方具有先手优势 (${ms} > ${es})，建议首回合压制。` : 
            `🐢 对方速度更快 (${es} > ${ms})，首回合建议防守或预判。`;
            
        return { moveOrder };
    },

    // 3. 模拟模拟胜率 (属性 + 种族值综合评估)
    simulateWinRate: function(myPet, enPet) {
        let score = 50; 

        // A. 属性克制逻辑 (需配合 config.js)
        if (window.ROCO_CONFIG && ROCO_CONFIG.getMultiplier) {
            const m = ROCO_CONFIG.getMultiplier(myPet.element, enPet.element);
            score += (m - 1) * 30; 
        }

        // B. 种族值压制 (综合六维)
        const myTotal = Object.values(myPet.stats).reduce((a, b) => a + b, 0);
        const enTotal = Object.values(enPet.stats).reduce((a, b) => a + b, 0);
        score += (myTotal - enTotal) / 8;

        // C. 机制加分 (根据分析出的威胁/建议数量)
        const myM = this.analyzeMechanics(myPet);
        const enM = this.analyzeMechanics(enPet);
        score += (myM.advice.length - enM.threats.length) * 3;

        return Math.min(98, Math.max(2, Math.round(score)));
    }
};
