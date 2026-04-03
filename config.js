const ROCO_CONFIG = {
    TYPE_CHART: {
        "火": { "strong": ["草", "冰", "虫", "机械"], "weak": ["水", "石", "土"] },
        "水": { "strong": ["火", "石", "土"], "weak": ["草", "电"] },
        "草": { "strong": ["水", "石", "土"], "weak": ["火", "冰", "虫", "毒", "翼"] },
        "电": { "strong": ["水", "翼"], "weak": ["土"] },
        "冰": { "strong": ["草", "土", "翼", "龙"], "weak": ["火", "武", "石", "机械"] },
        "武": { "strong": ["普通", "冰", "石", "恶魔", "机械"], "weak": ["翼", "萌", "幽灵"] },
        "毒": { "strong": ["草", "萌"], "weak": ["土", "萌"] },
        "土": { "strong": ["火", "电", "毒", "石", "机械"], "weak": ["水", "草", "冰"] },
        "翼": { "strong": ["草", "武", "虫"], "weak": ["电", "冰", "石"] },
        "萌": { "strong": ["武", "毒"], "weak": ["虫", "幽灵", "恶魔"] },
        "虫": { "strong": ["草", "萌", "恶魔"], "weak": ["火", "翼", "石"] },
        "石": { "strong": ["火", "冰", "翼", "虫"], "weak": ["水", "草", "武", "土", "机械"] },
        "幽灵": { "strong": ["萌", "幽灵"], "weak": ["幽灵", "恶魔"] },
        "龙": { "strong": ["龙"], "weak": ["冰", "龙"] },
        "恶魔": { "strong": ["萌", "幽灵"], "weak": ["武", "虫"] },
        "机械": { "strong": ["冰", "石"], "weak": ["火", "武", "土"] },
        "普通": { "strong": [], "weak": ["武"] },
        "光": { "strong": ["幽灵", "恶魔"], "weak": ["草", "光"] }
    },
    getMultiplier: function(attackerType, defenderType) {
        if (this.TYPE_CHART[attackerType]?.strong.includes(defenderType)) return 2.0;
        if (this.TYPE_CHART[attackerType]?.weak.includes(defenderType)) return 0.5;
        return 1.0;
    }
};
