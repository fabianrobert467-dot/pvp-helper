/**
 * 洛克对局核心处理器 V-ULTRA
 * 包含：伤害公式、极速判定、斩杀线预警
 */
const RocoEngine = {
    // 简易洛克伤害公式： ( (等级*0.4 + 2) * 威力 * 攻击力 / 防御力 ) / 50 + 2
    // 此处满级为60级
    calcDamage: function(attacker, defender, skill, atkMult) {
        if (skill.category === "变化" || skill.power === 0) return 0;
        
        // 区分物攻与魔攻
        const a_stat = skill.category === "物理" ? Number(attacker.stats.atk) : Number(attacker.stats.sp_atk);
        const d_stat = skill.category === "物理" ? Number(defender.stats.def) : Number(defender.stats.sp_def);
        
        // 满级血量估算 (种族值*2 + 204)
        const defMaxHp = Number(defender.stats.hp) * 2 + 204; 

        // 基础伤害计算
        let damage = (((42 * skill.power * a_stat / d_stat) / 50) + 2) * atkMult;
        
        // 本系加成 (STAB)
        if (skill.element === attacker.element) damage *= 1.5;

        // 计算伤害占对方总血量的百分比
        return (damage / defMaxHp) * 100; 
    },

    analyzeTactics: function(my, en, myHpPct, enHpPct) {
        // 1. 属性倍率
        const myAtkMult = ROCO_CONFIG.getMult(my.element, en.element);
        const enAtkMult = ROCO_CONFIG.getMult(en.element, my.element);

        // 2. 搜寻我方最优解技能 (Max Damage)
        let bestSkill = null;
        let maxDmgPct = 0;
        
        if (my.skills && my.skills.length > 0) {
            my.skills.forEach(s => {
                const dmg = this.calcDamage(my, en, s, myAtkMult);
                if (dmg > maxDmgPct) {
                    maxDmgPct = dmg;
                    bestSkill = s;
                }
            });
        }

        // 3. 速度与先手博弈
        const mySpeed = Number(my.stats.speed);
        const enSpeed = Number(en.stats.speed);
        let speedAdvantage = mySpeed > enSpeed ? "我方" : "敌方";
        
        // 检查对方是否有高先手技能
        let enMaxPriority = 0;
        if (en.skills) {
            en.skills.forEach(s => { if (s.priority > enMaxPriority) enMaxPriority = s.priority; });
        }

        // 4. 战局断言生成
        let intel = [];
        let winScore = 50 + (myHpPct - enHpPct)*0.4 + (myAtkMult - enAtkMult)*20;

        if (bestSkill && maxDmgPct > 0) {
            intel.push(`✅ 建议主攻：【${bestSkill.name}】(预计削减敌方 ${maxDmgPct.toFixed(1)}% 血量)`);
            if (maxDmgPct >= enHpPct) {
                intel.push("🎯 敌方已在我方绝对斩杀线内！");
                winScore += 30;
            }
        }

        if (enMaxPriority > 0 && enHpPct < 30) {
            intel.push(`🚨 极度危险：敌方拥有先手+${enMaxpriority 技能，可能会抢速补刀！`);
            if (mySpeed > enSpeed) winScore -= 15; // 原本速度快的现在可能被反杀
        }

        return {
            winRate: Math.min(99, Math.max(1, Math.round(winRate))),
            bestMove: bestSkill ? bestSkill.name : "防控/强化",
            speedWinner: speedAdvantage,
            intel: intel
        };
    }
};
