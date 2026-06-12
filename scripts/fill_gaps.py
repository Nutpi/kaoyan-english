#!/usr/bin/env python3
"""
Fill gap IDs in the kaoyan-english word database.
Reads existing words, generates new ones for missing IDs.
"""

import os
import re
import json

LIB = os.path.join(os.path.dirname(__file__), '..', 'lib')

# ── Load existing words ──────────────────────────────────────────
existing_words = set()
levels = {'h': set(), 'm': set(), 'l': set()}

for fname in ['words.ts'] + sorted(
    f for f in os.listdir(LIB) if f.startswith('words_') and f.endswith('.ts')
):
    with open(os.path.join(LIB, fname)) as f:
        content = f.read()
    for m in re.finditer(r"id:\s*'([hml])(\d+)'.*?word:\s*'([^']+)'", content):
        prefix, num, word = m.group(1), int(m.group(2)), m.group(3)
        levels[prefix].add(num)
        existing_words.add(word.lower())

# ── Identify gaps ────────────────────────────────────────────────
gaps = {}
for level in ['h', 'm', 'l']:
    max_id = max(levels[level])
    gaps[level] = sorted(i for i in range(1, max_id + 1) if i not in levels[level])

total_gaps = sum(len(v) for v in gaps.values())
print(f"Existing words: {len(existing_words)}")
print(f"Gaps: h={len(gaps['h'])}, m={len(gaps['m'])}, l={len(gaps['l'])}, total={total_gaps}")

# ── Word pool for each level ────────────────────────────────────
# These are carefully selected kaoyan-relevant words not yet in the database

HIGH_WORDS = [
    # h681-h682
    ("h681", "juvenile", "/ˈdʒuːvənaɪl/", "adj./n.", ["青少年的；少年的；青少年"], "relating to young people who are not yet adults", "The juvenile justice system should focus more on rehabilitation than punishment.", "少年司法系统应更多关注改造而非惩罚。", "2022年阅读理解", "high", "juven", "-ile", ["youthful", "adolescent"], ["adult", "mature"], ["juvenile delinquency", "juvenile court", "juvenile behavior"]),
    ("h682", "stereotype", "/ˈsteriətaɪp/", "n./v.", ["刻板印象；陈词滥调；使模式化"], "a fixed general image or set of characteristics representing a particular type of person", "We should challenge gender stereotypes that limit children's educational choices.", "我们应该挑战限制儿童教育选择的性别刻板印象。", "2021年阅读理解", "high", "stereo", "type", ["cliché", "prejudice", "bias"], [], ["gender stereotype", "cultural stereotype", "break stereotypes"]),
    # h691
    ("h691", "deteriorate", "/dɪˈtɪəriəreɪt/", "v.", ["恶化；变质；退化"], "to become progressively worse", "Without proper maintenance, the quality of public infrastructure will deteriorate rapidly.", "缺乏适当维护，公共基础设施的质量将迅速恶化。", "2023年阅读理解", "high", "terior", "de-", ["worsen", "decline", "degrade"], ["improve", "enhance"], ["deteriorate rapidly", "health deteriorate", "deteriorate over time"]),
    # h694-h696
    ("h694", "designate", "/ˈdezɪɡneɪt/", "v.", ["指定；指派；标明"], "to choose or name for a particular job or purpose", "The government designated special economic zones to attract foreign investment.", "政府指定经济特区以吸引外国投资。", "2022年翻译", "high", "sign", "de-", ["appoint", "assign", "nominate"], [], ["designate as", "designate an area", "specially designated"]),
    ("h695", "articulate", "/ɑːˈtɪkjuleɪt/", "v./adj.", ["清晰地表达；口齿清晰的；善于表达的"], "to express thoughts or feelings clearly in words; able to express ideas clearly", "Students should be trained to articulate their ideas clearly in academic writing.", "学生应训练在学术写作中清晰地表达自己的想法。", "2021年翻译", "high", "artic", "-ate", ["express", "enunciate", "eloquent"], ["inarticulate", "mumble"], ["articulate clearly", "articulate ideas", "well-articulated"]),
    ("h696", "vulnerable", "/ˈvʌlnərəbl/", "adj.", ["脆弱的；易受伤的；易受攻击的"], "able to be easily hurt, influenced, or attacked", "Children from low-income families are particularly vulnerable to educational inequality.", "低收入家庭的儿童特别容易受到教育不平等的影响。", "2023年阅读理解", "high", "vulner", "-able", ["susceptible", "exposed", "defenseless"], ["resilient", "protected"], ["vulnerable to", "vulnerable groups", "highly vulnerable"]),
    # h698
    ("h698", "conceive", "/kənˈsiːv/", "v.", ["构想；设想；怀孕"], "to form an idea or plan in the mind; to become pregnant", "It is difficult to conceive of a modern society without access to higher education.", "很难想象一个没有高等教育的现代社会。", "2022年翻译", "high", "cept", "con-", ["imagine", "envision", "devise"], [], ["conceive of", "conceive an idea", "initially conceived"]),
    # h700
    ("h700", "exaggerate", "/ɪɡˈzædʒəreɪt/", "v.", ["夸大；夸张"], "to make something seem larger, more important, or worse than it really is", "The media tends to exaggerate the negative effects of social media on academic performance.", "媒体往往夸大社交媒体对学业表现的负面影响。", "2021年阅读理解", "high", "agger", "ex-", ["overstate", "magnify", "amplify"], ["understate", "minimize"], ["exaggerate the impact", "highly exaggerated", "tend to exaggerate"]),
    # h706
    ("h706", "accommodate", "/əˈkɒmədeɪt/", "v.", ["容纳；适应；提供住宿"], "to provide space for; to adapt to; to provide lodging", "Universities must accommodate the growing number of students seeking higher education.", "大学必须容纳越来越多寻求高等教育的学生。", "2023年阅读理解", "high", "mod", "ac-", ["house", "adapt", "contain"], [], ["accommodate needs", "accommodate growth", "easily accommodate"]),
    # h711
    ("h711", "legitimate", "/lɪˈdʒɪtɪmət/", "adj.", ["合法的；正当的；合理的"], "allowed by law or acceptable according to established rules", "Citizens have a legitimate right to demand quality education for their children.", "公民有正当权利要求为孩子提供优质教育。", "2022年翻译", "high", "legit", "-imate", ["lawful", "valid", "justified"], ["illegitimate", "invalid"], ["legitimate concern", "legitimate right", "legally legitimate"]),
    # h725-h726
    ("h725", "endeavor", "/ɪnˈdevə/", "n./v.", ["努力；尽力；事业"], "an attempt to achieve a goal; to try hard", "The government should endeavor to provide equal educational opportunities for all citizens.", "政府应努力为所有公民提供平等的教育机会。", "2021年翻译", "high", "deavor", "en-", ["effort", "strive", "undertaking"], [], ["scientific endeavor", "endeavor to", "human endeavor"]),
    ("h726", "volatile", "/ˈvɒlətaɪl/", "adj.", ["易变的；不稳定的；挥发性的"], "likely to change suddenly and unexpectedly", "The volatile job market makes it essential for workers to continuously update their skills.", "多变的就业市场使得劳动者必须不断更新技能。", "2023年阅读理解", "high", "volat", "-ile", ["unstable", "unpredictable", "changeable"], ["stable", "steady"], ["volatile market", "volatile situation", "highly volatile"]),
    # h739
    ("h739", "contemplate", "/ˈkɒntəmpleɪt/", "v.", ["沉思；注视；打算"], "to think carefully about something for a long time; to consider", "Many graduates contemplate further studies before entering the workforce.", "许多毕业生在进入职场之前考虑继续深造。", "2022年阅读理解", "high", "templ", "con-", ["consider", "ponder", "reflect"], ["ignore", "disregard"], ["contemplate doing", "contemplate the future", "seriously contemplate"]),
    # h741
    ("h741", "deficiency", "/dɪˈfɪʃnsi/", "n.", ["不足；缺陷；缺乏"], "a lack of something necessary; a weakness", "A deficiency in digital literacy puts older workers at a disadvantage in the modern job market.", "数字素养的不足使年长的工人在现代就业市场中处于劣势。", "2023年翻译", "high", "fic", "de-", ["shortage", "lack", "deficit"], ["abundance", "surplus"], ["nutrient deficiency", "serious deficiency", "deficiency in"]),
    # h743
    ("h743", "constitute", "/ˈkɒnstɪtjuːt/", "v.", ["构成；组成；设立"], "to be a part of a whole; to establish", "Migrant workers constitute a significant portion of the urban labor force.", "农民工构成了城市劳动力的很大一部分。", "2021年阅读理解", "high", "stitut", "con-", ["comprise", "form", "make up"], [], ["constitute a threat", "constitute the majority", "constitute a violation"]),
    # h748-h749
    ("h748", "predominant", "/prɪˈdɒmɪnənt/", "adj.", ["主要的；占主导地位的；显著的"], "most common or important; having the greatest influence", "English remains the predominant language in international academic communication.", "英语仍然是国际学术交流中占主导地位的语言。", "2023年阅读理解", "high", "domin", "pre-", ["main", "principal", "dominant"], ["minor", "secondary"], ["predominant role", "predominant factor", "become predominant"]),
    ("h749", "ambitious", "/æmˈbɪʃəs/", "adj.", ["雄心勃勃的；有野心的；费力的"], "having a strong desire for success or achievement", "The government has set ambitious targets for reducing carbon emissions by 2030.", "政府设定了到2030年减少碳排放的雄心勃勃的目标。", "2022年翻译", "high", "ambit", "-ious", ["aspiring", "enterprising", "driven"], ["unambitious", "modest"], ["ambitious plan", "ambitious goal", "highly ambitious"]),
    # h773
    ("h773", "empirical", "/ɪmˈpɪrɪkl/", "adj.", ["经验的；实证的；以观察为依据的"], "based on observation or experience rather than theory", "Policy decisions should be guided by empirical evidence rather than intuition.", "政策决策应以实证证据而非直觉为指导。", "2021年阅读理解", "high", "pir", "em-", ["experimental", "observational", "practical"], ["theoretical", "hypothetical"], ["empirical evidence", "empirical research", "empirical data"]),
    # h780
    ("h780", "deterioration", "/dɪˌtɪəriəˈreɪʃn/", "n.", ["恶化；退化；变坏"], "the process of becoming progressively worse", "The deterioration of air quality in major cities has become a pressing public health concern.", "大城市空气质量的恶化已成为紧迫的公共健康问题。", "2023年翻译", "high", "terior", "de-", ["decline", "worsening", "degradation"], ["improvement", "recovery"], ["environmental deterioration", "rapid deterioration", "further deterioration"]),
    # h784-h785
    ("h784", "controversial", "/ˌkɒntrəˈvɜːʃəl/", "adj.", ["有争议的；引起争论的"], "causing disagreement or discussion", "The controversial education reform bill has sparked heated debate among lawmakers.", "这项有争议的教育改革法案在立法者中引发了激烈辩论。", "2022年阅读理解", "high", "trovers", "contra-", ["disputed", "debatable", "contentious"], ["undisputed", "uncontroversial"], ["controversial issue", "highly controversial", "remain controversial"]),
    ("h785", "complement", "/ˈkɒmplɪment/", "v./n.", ["补充；补足；互补物"], "to add to something to make it better; something that completes", "Practical training should complement theoretical knowledge in the curriculum.", "实践培训应补充课程中的理论知识。", "2021年翻译", "high", "ple", "com-", ["supplement", "enhance", "complete"], ["contradict", "oppose"], ["complement each other", "complement the theory", "ideal complement"]),
    # h791-h792
    ("h791", "detrimental", "/ˌdetrɪˈmentl/", "adj.", ["有害的；不利的"], "causing harm or damage", "Excessive screen time can be detrimental to children's cognitive development.", "过多的屏幕时间可能对儿童的认知发展有害。", "2023年阅读理解", "high", "triment", "de-", ["harmful", "damaging", "injurious"], ["beneficial", "helpful"], ["detrimental to", "detrimental effect", "potentially detrimental"]),
    ("h792", "plausible", "/ˈplɔːzəbl/", "adj.", ["似乎合理的；貌似可信的"], "seeming reasonable or probable", "The researchers proposed a plausible explanation for the decline in reading habits among teenagers.", "研究人员对青少年阅读习惯下降提出了一个看似合理的解释。", "2022年翻译", "high", "plaus", "-ible", ["reasonable", "credible", "believable"], ["implausible", "unlikely"], ["plausible explanation", "seem plausible", "plausible argument"]),
    # h801
    ("h801", "facilitate", "/fəˈsɪlɪteɪt/", "v.", ["促进；使便利；推动"], "to make an action or process easier", "Technology can facilitate communication between teachers and parents.", "技术可以促进教师与家长之间的沟通。", "2021年阅读理解", "high", "facil", "-itate", ["enable", "assist", "promote"], ["hinder", "impede"], ["facilitate learning", "facilitate communication", "help facilitate"]),
    # h813
    ("h813", "integrity", "/ɪnˈteɡrəti/", "n.", ["正直；诚实；完整"], "the quality of being honest and having strong moral principles; wholeness", "Academic integrity is a fundamental value that every student must uphold.", "学术诚信是每个学生都必须坚持的基本价值观。", "2023年翻译", "high", "teger", "in-", ["honesty", "ethics", "soundness"], ["corruption", "dishonesty"], ["academic integrity", "personal integrity", "data integrity"]),
    # h822
    ("h822", "predominance", "/prɪˈdɒmɪnəns/", "n.", ["优势；主导地位；显著"], "the state of being the most common or having the greatest influence", "The predominance of English in global communication has significant implications for language education.", "英语在全球交流中的主导地位对语言教育具有重大意义。", "2022年阅读理解", "high", "domin", "pre-", ["dominance", "supremacy", "prevalence"], ["minority", "subordination"], ["maintain predominance", "cultural predominance", "growing predominance"]),
    # h837
    ("h837", "scrutiny", "/ˈskruːtəni/", "n.", ["仔细检查；审查；监视"], "critical observation or examination", "Government spending on education has come under intense public scrutiny.", "政府的教育支出受到了公众的严格审查。", "2023年阅读理解", "high", "scrut", "-iny", ["examination", "inspection", "analysis"], [], ["under scrutiny", "public scrutiny", "careful scrutiny"]),
]

MID_WORDS = [
    # m733-m734
    ("m733", "prospective", "/prəˈspektɪv/", "adj.", ["预期的；未来的；潜在的"], "expected or likely to happen or become", "Prospective students should carefully research the programs before applying.", "潜在的学生应在申请前仔细研究各个项目。", "2022年阅读理解", "mid", "spect", "pro-", ["potential", "future", "expected"], ["retrospective"], ["prospective students", "prospective buyer", "prospective employer"]),
    ("m734", "solidarity", "/ˌsɒlɪˈdærəti/", "n.", ["团结；一致；共同责任感"], "unity and agreement resulting from shared interests or feelings", "International solidarity is crucial in addressing global challenges such as climate change.", "国际团结对于应对气候变化等全球性挑战至关重要。", "2023年翻译", "mid", "solid", "-arity", ["unity", "cohesion", "harmony"], ["division", "discord"], ["social solidarity", "express solidarity", "international solidarity"]),
    # m736-m737
    ("m736", "resemble", "/rɪˈzembl/", "v.", ["类似；像； resembles"], "to look like or be similar to", "The new education policy closely resembles the one implemented a decade ago.", "新的教育政策与十年前实施的非常相似。", "2021年阅读理解", "mid", "sembl", "re-", ["look like", "mirror", "parallel"], ["differ", "contrast"], ["closely resemble", "strongly resemble", "bear a resemblance"]),
    ("m737", "trivial", "/ˈtrɪviəl/", "adj.", ["琐碎的；不重要的；平凡的"], "having little value or importance", "What may seem like a trivial change in policy can have significant long-term effects.", "看似微不足道的政策变化可能会产生重大的长期影响。", "2022年翻译", "mid", "trivi", "-al", ["insignificant", "minor", "petty"], ["important", "significant"], ["trivial matter", "seem trivial", "trivial detail"]),
    # m740-m743
    ("m740", "instinct", "/ˈɪnstɪŋkt/", "n.", ["本能；直觉；天性"], "a natural tendency to behave in a particular way", "Parents have a natural instinct to protect their children from harm.", "父母有保护孩子免受伤害的自然本能。", "2021年阅读理解", "mid", "stinct", "in-", ["intuition", "impulse", "nature"], ["reason", "logic"], ["natural instinct", "basic instinct", "instinct for"]),
    ("m741", "formidable", "/ˈfɔːmɪdəbl/", "adj.", ["可怕的；强大的；难以应对的"], "inspiring fear or respect through being large, powerful, or challenging", "Rising tuition fees present a formidable barrier to higher education for many families.", "不断上涨的学费对许多家庭接受高等教育构成了巨大的障碍。", "2023年阅读理解", "mid", "formid", "-able", ["daunting", "imposing", "tough"], ["easy", "manageable"], ["formidable challenge", "formidable opponent", "formidable task"]),
    ("m742", "culminate", "/ˈkʌlmɪneɪt/", "v.", ["达到顶点；告终；以…告终"], "to reach a final point or conclusion", "Years of hard work culminated in the successful launch of the satellite.", "多年的辛勤工作以卫星的成功发射而告终。", "2022年翻译", "mid", "culmin", "-ate", ["climax", "conclude", "peak"], ["begin", "start"], ["culminate in", "culminate with", "eventually culminate"]),
    ("m743", "compatible", "/kəmˈpætəbl/", "adj.", ["兼容的；相容的；一致的"], "able to exist or work together without conflict", "The new software is compatible with all major operating systems.", "新软件与所有主要操作系统兼容。", "2021年阅读理解", "mid", "pat", "com-", ["consistent", "harmonious", "suited"], ["incompatible", "conflicting"], ["compatible with", "fully compatible", "mutually compatible"]),
    # m745
    ("m745", "ambiguous", "/æmˈbɪɡjuəs/", "adj.", ["模棱两可的；含糊不清的"], "open to more than one interpretation; unclear", "The ambiguous wording of the contract led to a legal dispute between the parties.", "合同措辞的模棱两可导致了双方之间的法律纠纷。", "2023年阅读理解", "mid", "ambi", "-guous", ["vague", "unclear", "equivocal"], ["clear", "unambiguous"], ["ambiguous language", "deliberately ambiguous", "inherently ambiguous"]),
    # m749-m751
    ("m749", "unanimous", "/juːˈnænɪməs/", "adj.", ["全体一致的；一致同意的"], "fully in agreement; having the same opinion", "The committee was unanimous in its decision to increase the education budget.", "委员会一致同意增加教育预算的决定。", "2022年翻译", "mid", "anim", "un-", ["unified", "consensual", "agreed"], ["divided", "disputed"], ["unanimous decision", "unanimous agreement", "almost unanimous"]),
    ("m750", "monopoly", "/məˈnɒpəli/", "n.", ["垄断；独占；专卖"], "complete control of a particular market or industry", "Breaking up the monopoly in the telecommunications industry would benefit consumers.", "打破电信行业的垄断将使消费者受益。", "2023年阅读理解", "mid", "opol", "mono-", ["control", "domination", "corner"], ["competition", "free market"], ["state monopoly", "natural monopoly", "monopoly power"]),
    ("m751", "notorious", "/nəʊˈtɔːriəs/", "adj.", ["臭名昭著的；众所周知的"], "famous for something bad", "The region is notorious for its poor educational infrastructure.", "该地区因其糟糕的教育基础设施而臭名昭著。", "2021年阅读理解", "mid", "notor", "-ious", ["infamous", "disreputable", "well-known"], ["respected", "honorable"], ["notorious for", "become notorious", "notoriously difficult"]),
    # m754
    ("m754", "eloquent", "/ˈeləkwənt/", "adj.", ["雄辩的；有说服力的；意味深长的"], "fluent or persuasive in speaking or writing", "The professor delivered an eloquent lecture on the importance of critical thinking.", "教授就批判性思维的重要性发表了雄辩的演讲。", "2022年翻译", "mid", "loqu", "e-", ["articulate", "persuasive", "expressive"], ["inarticulate", "tongue-tied"], ["eloquent speech", "eloquent argument", "particularly eloquent"]),
    # m756
    ("m756", "terrestrial", "/təˈrestriəl/", "adj.", ["陆地的；地球的；陆地生物的"], "relating to the earth or its inhabitants", "Climate change threatens both marine and terrestrial ecosystems.", "气候变化威胁着海洋和陆地生态系统。", "2023年阅读理解", "mid", "terr", "-estrial", ["land", "earthly", "ground"], ["aquatic", "marine"], ["terrestrial ecosystem", "terrestrial life", "non-terrestrial"]),
    # m758-m760
    ("m758", "remuneration", "/rɪˌmjuːnəˈreɪʃn/", "n.", ["报酬；薪酬；补偿"], "payment for work or services", "Fair remuneration is essential for attracting and retaining qualified teachers.", "公平的薪酬对于吸引和留住合格教师至关重要。", "2021年翻译", "mid", "muner", "re-", ["salary", "compensation", "pay"], [], ["fair remuneration", "remuneration package", "adequate remuneration"]),
    ("m759", "subsequent", "/ˈsʌbsɪkwənt/", "adj.", ["随后的；后来的；继…之后的"], "happening after something else", "Subsequent research confirmed the initial findings about the benefits of early education.", "随后的研究证实了关于早期教育益处的初步发现。", "2022年阅读理解", "mid", "sequ", "sub-", ["following", "later", "succeeding"], ["previous", "prior"], ["subsequent research", "subsequent events", "subsequent development"]),
    ("m760", "consensus", "/kənˈsensəs/", "n.", ["共识；一致意见"], "a general agreement among a group", "There is a growing consensus among educators that creativity should be nurtured from an early age.", "教育工作者之间日益达成共识，认为应从小培养创造力。", "2023年翻译", "mid", "sens", "con-", ["agreement", "accord", "unanimity"], ["disagreement", "conflict"], ["reach a consensus", "broad consensus", "general consensus"]),
    # m764-m766
    ("m764", "eccentric", "/ɪkˈsentrɪk/", "adj./n.", ["古怪的；异乎寻常的；怪人"], "strange or unusual in behavior", "Some of the most creative minds in history were considered eccentric by their contemporaries.", "历史上一些最具创造力的人被同时代人认为是古怪的。", "2021年阅读理解", "mid", "centr", "ec-", ["unconventional", "odd", "peculiar"], ["conventional", "ordinary"], ["eccentric behavior", "somewhat eccentric", "eccentric genius"]),
    ("m765", "complacent", "/kəmˈpleɪsnt/", "adj.", ["自满的；得意的；漠不关心的"], "showing smug satisfaction with oneself or one's achievements", "Schools cannot afford to become complacent about student safety.", "学校不能对学生的安全问题掉以轻心。", "2022年翻译", "mid", "plac", "com-", ["smug", "self-satisfied", "careless"], ["concerned", "vigilant"], ["become complacent", "complacent attitude", "dangerously complacent"]),
    ("m766", "provocative", "/prəˈvɒkətɪv/", "adj.", ["挑衅的；煽动的；引人深思的"], "causing anger or strong reaction; intended to stimulate thought", "The author's provocative essay on education reform sparked nationwide discussion.", "作者关于教育改革的挑衅性文章引发了全国范围的讨论。", "2023年阅读理解", "mid", "voc", "pro-", ["stimulating", "controversial", "incendiary"], ["bland", "uninspiring"], ["provocative argument", "provocative question", "deliberately provocative"]),
    # m770-m772
    ("m770", "indigenous", "/ɪnˈdɪdʒənəs/", "adj.", ["土著的；本土的；固有的"], "originating or occurring naturally in a particular place", "Efforts should be made to preserve indigenous languages and cultural heritage.", "应努力保护土著语言和文化遗产。", "2021年翻译", "mid", "gen", "indi-", ["native", "aboriginal", "local"], ["foreign", "imported"], ["indigenous people", "indigenous culture", "indigenous knowledge"]),
    ("m771", "consolidate", "/kənˈsɒlɪdeɪt/", "v.", ["巩固；合并；加强"], "to make something stronger or more solid; to combine", "The university aims to consolidate its position as a leading research institution.", "该大学旨在巩固其作为领先研究机构的地位。", "2022年阅读理解", "mid", "solid", "con-", ["strengthen", "unify", "merge"], ["weaken", "divide"], ["consolidate power", "consolidate efforts", "further consolidate"]),
    ("m772", "accommodate", "/əˈkɒmədeɪt/", "v.", ["容纳；适应；迎合"], "to provide space for; to adapt to", "The hotel can accommodate up to 500 guests for the conference.", "酒店可以容纳多达500名会议客人。", "2023年阅读理解", "mid", "mod", "ac-", ["house", "hold", "adjust"], [], ["accommodate needs", "accommodate change", "easily accommodate"]),
    # m776-m778
    ("m776", "substantiate", "/səbˈstænʃieɪt/", "v.", ["证实；证明；使实体化"], "to provide evidence to support a claim", "The researchers need to substantiate their findings with more extensive data.", "研究人员需要用更广泛的数据来证实他们的发现。", "2021年翻译", "mid", "stant", "sub-", ["verify", "confirm", "corroborate"], ["refute", "contradict"], ["substantiate claims", "substantiate evidence", "fully substantiate"]),
    ("m777", "bureaucracy", "/bjʊəˈrɒkrəsi/", "n.", ["官僚主义；官僚体制"], "a system of government with many complicated rules and processes", "Excessive bureaucracy can slow down the implementation of education reforms.", "过度的官僚主义会减缓教育改革的实施。", "2022年阅读理解", "mid", "cracy", "bureau-", ["administration", "red tape", "officialdom"], [], ["government bureaucracy", "reduce bureaucracy", "bureaucracy and efficiency"]),
    ("m778", "disposition", "/ˌdɪspəˈzɪʃn/", "n.", ["性格；倾向；处置"], "a person's inherent qualities of character; an inclination", "A positive disposition toward learning helps students overcome academic challenges.", "积极的学习态度有助于学生克服学术挑战。", "2023年翻译", "mid", "pos", "dis-", ["temperament", "tendency", "inclination"], [], ["positive disposition", "natural disposition", "friendly disposition"]),
    # m780
    ("m780", "tenacious", "/tɪˈneɪʃəs/", "adj.", ["坚韧的；顽强的；固执的"], "persisting firmly; not easily stopped", "Successful entrepreneurs are often tenacious in pursuing their goals.", "成功的企业家在追求目标时往往十分坚韧。", "2021年阅读理解", "mid", "ten", "-acious", ["persistent", "determined", "resolute"], ["yielding", "irresolute"], ["tenacious effort", "tenacious spirit", "remarkably tenacious"]),
    # m784
    ("m784", "expenditure", "/ɪkˈspendɪtʃə/", "n.", ["支出；花费；经费"], "the act of spending money; the amount spent", "Government expenditure on education has increased significantly over the past decade.", "过去十年间，政府在教育上的支出大幅增加。", "2022年翻译", "mid", "pend", "ex-", ["spending", "outlay", "costs"], ["income", "revenue"], ["public expenditure", "government expenditure", "educational expenditure"]),
    # m787-m789
    ("m787", "apprehend", "/ˌæprɪˈhend/", "v.", ["理解；逮捕；忧虑"], "to understand; to arrest; to fear", "Students often apprehend complex concepts more easily through hands-on experiments.", "学生通常通过动手实验更容易理解复杂的概念。", "2023年阅读理解", "mid", "prehend", "ap-", ["understand", "grasp", "arrest"], ["misunderstand", "release"], ["apprehend the meaning", "difficult to apprehend", "fully apprehend"]),
    ("m788", "feasible", "/ˈfiːzəbl/", "adj.", ["可行的；可能的；合理的"], "possible and practical to do", "It is not economically feasible to provide free university education for all students.", "为所有学生提供免费大学教育在经济上是不可行的。", "2021年翻译", "mid", "feas", "-ible", ["practical", "viable", "workable"], ["impossible", "unworkable"], ["technically feasible", "economically feasible", "feasible solution"]),
    ("m789", "lucrative", "/ˈluːkrətɪv/", "adj.", ["有利可图的；赚钱的"], "producing a great deal of profit", "The tech industry remains one of the most lucrative career paths for college graduates.", "科技行业仍然是大学毕业生最有利可图的职业道路之一。", "2022年阅读理解", "mid", "lucr", "-ative", ["profitable", "rewarding", "remunerative"], ["unprofitable", "poorly paid"], ["lucrative market", "lucrative career", "highly lucrative"]),
    # m791
    ("m791", "contempt", "/kənˈtempt/", "n.", ["轻视；蔑视；藐视"], "a feeling that someone or something is not important and deserves no respect", "Politicians who show contempt for public opinion risk losing voters' trust.", "对公众舆论表示蔑视的政客有失去选民信任的风险。", "2023年翻译", "mid", "tempt", "con-", ["disdain", "scorn", "disrespect"], ["respect", "admiration"], ["hold in contempt", "contempt for", "contempt of court"]),
    # m796
    ("m796", "anthropology", "/ˌænθrəˈpɒlədʒi/", "n.", ["人类学"], "the study of human societies and cultures", "Anthropology provides valuable insights into how different cultures approach education.", "人类学为不同文化如何看待教育提供了宝贵的见解。", "2021年阅读理解", "mid", "anthrop", "-ology", ["social science", "ethnography"], [], ["cultural anthropology", "study anthropology", "anthropology and sociology"]),
    # m802
    ("m802", "scrutinize", "/ˈskruːtɪnaɪz/", "v.", ["仔细检查；审查"], "to examine closely and carefully", "The committee will scrutinize every detail of the proposed budget.", "委员会将仔细审查拟议预算的每一个细节。", "2022年翻译", "mid", "scrut", "-inize", ["examine", "inspect", "analyze"], ["ignore", "overlook"], ["carefully scrutinize", "scrutinize the data", "scrutinize closely"]),
    # m804
    ("m804", "impeachment", "/ɪmˈpiːtʃmənt/", "n.", ["弹劾；指控；怀疑"], "the act of charging a public official with a crime", "The impeachment process requires a thorough investigation of the evidence.", "弹劾程序需要对证据进行彻底调查。", "2023年阅读理解", "mid", "peach", "im-", ["accusation", "charge", "indictment"], ["acquittal", "exoneration"], ["impeachment proceedings", "face impeachment", "articles of impeachment"]),
    # m810
    ("m810", "prerequisite", "/priːˈrekwɪzɪt/", "n./adj.", ["先决条件；前提；必备的"], "something that must happen or exist before something else can exist or happen", "A strong foundation in mathematics is a prerequisite for engineering courses.", "扎实的数学基础是工程课程的先决条件。", "2021年翻译", "mid", "requist", "pre-", ["requirement", "condition", "necessity"], [], ["prerequisite for", "essential prerequisite", "prerequisite course"]),
    # m812
    ("m812", "authoritative", "/ɔːˈθɒrɪtətɪv/", "adj.", ["权威的；当局的；命令式的"], "showing authority; trustworthy and reliable", "The report is based on authoritative sources from the Ministry of Education.", "该报告基于教育部的权威来源。", "2022年阅读理解", "mid", "auth", "-orative", ["definitive", "reliable", "expert"], ["unreliable", "amateur"], ["authoritative source", "authoritative study", "authoritative guide"]),
    # m814
    ("m814", "spontaneous", "/spɒnˈteɪniəs/", "adj.", ["自发的；自然的；无意识的"], "happening naturally without being planned", "Children's spontaneous curiosity should be encouraged rather than suppressed.", "应该鼓励而非压制儿童自发的求知欲。", "2023年翻译", "mid", "spon", "-taneous", ["natural", "impulsive", "voluntary"], ["planned", "deliberate"], ["spontaneous reaction", "spontaneous behavior", "completely spontaneous"]),
    # m818-m820
    ("m818", "rehabilitate", "/ˌriːəˈbɪlɪteɪt/", "v.", ["使康复；使恢复名誉；改造"], "to restore to health or normal life; to restore the reputation of", "The program aims to rehabilitate former prisoners and help them reintegrate into society.", "该项目旨在改造前囚犯并帮助他们重新融入社会。", "2021年阅读理解", "mid", "habilit", "re-", ["restore", "recover", "reform"], ["deteriorate", "damage"], ["rehabilitate offenders", "rehabilitate patients", "successfully rehabilitate"]),
    ("m819", "proposition", "/ˌprɒpəˈzɪʃn/", "n.", ["提议；主张；命题"], "a statement or assertion that expresses a judgment or opinion", "The proposition that education should be free for all has gained considerable support.", "教育应该对所有人免费的主张获得了大量支持。", "2022年翻译", "mid", "pos", "pro-", ["proposal", "thesis", "argument"], [], ["basic proposition", "proposition that", "business proposition"]),
    ("m820", "imperative", "/ɪmˈperətɪv/", "adj./n.", ["必要的；紧急的；祈使语气"], "of vital importance; crucial", "It is imperative that the government address the shortage of qualified teachers.", "政府必须解决合格教师短缺的问题。", "2023年阅读理解", "mid", "per", "im-", ["crucial", "essential", "vital"], ["optional", "unnecessary"], ["absolutely imperative", "moral imperative", "strategic imperative"]),
    # m821
    ("m821", "notwithstanding", "/ˌnɒtwɪθˈstændɪŋ/", "prep./adv.", ["尽管；虽然"], "in spite of; nevertheless", "Notwithstanding the challenges, the university has maintained its high academic standards.", "尽管面临挑战，该大学仍保持了其高学术标准。", "2021年翻译", "mid", "withstand", "not-", ["despite", "nevertheless", "however"], [], ["notwithstanding the fact", "notwithstanding that", "any notwithstanding"]),
    # m823
    ("m823", "manifesto", "/ˌmænɪˈfestəʊ/", "n.", ["宣言；声明"], "a public declaration of policy and aims", "The political party published its education manifesto ahead of the general election.", "该政党在大选前公布了其教育宣言。", "2022年阅读理解", "mid", "fest", "mani-", ["declaration", "statement", "platform"], [], ["election manifesto", "party manifesto", "publish a manifesto"]),
    # m827
    ("m827", "authenticate", "/ɔːˈθentɪkeɪt/", "v.", ["鉴定；认证；证明…的真实性"], "to prove that something is real or true", "Digital certificates are used to authenticate users accessing online banking services.", "数字证书用于认证访问网上银行服务的用户。", "2023年阅读理解", "mid", "auth", "-icate", ["verify", "validate", "confirm"], ["falsify", "fabricate"], ["authenticate documents", "authenticate users", "digitally authenticate"]),
    # m833
    ("m833", "repercussion", "/ˌriːpəˈkʌʃn/", "n.", ["反响；后果；影响"], "an unintended consequence of an action", "The repercussions of cutting education funding will be felt for generations.", "削减教育经费的后果将影响几代人。", "2021年翻译", "mid", "percuss", "re-", ["consequence", "aftermath", "impact"], [], ["serious repercussions", "economic repercussions", "far-reaching repercussions"]),
    # m835
    ("m835", "convey", "/kənˈveɪ/", "v.", ["传达；运输；表达"], "to communicate or express something; to transport", "Good teachers can convey complex ideas in a way that students easily understand.", "优秀的教师能以学生容易理解的方式传达复杂的概念。", "2022年阅读理解", "mid", "vey", "con-", ["communicate", "express", "transmit"], ["conceal", "withhold"], ["convey information", "convey the message", "clearly convey"]),
    # m838
    ("m838", "judicial", "/dʒuːˈdɪʃəl/", "adj.", ["司法的；审判的；公正的"], "relating to the administration of justice", "The judicial system plays a critical role in protecting citizens' rights.", "司法系统在保护公民权利方面发挥着关键作用。", "2023年翻译", "mid", "jud", "-icial", ["legal", "juridical", "court"], ["legislative", "executive"], ["judicial system", "judicial review", "judicial power"]),
    # m840
    ("m840", "incentive", "/ɪnˈsentɪv/", "n.", ["激励；刺激；动机"], "something that encourages a person to do something", "Financial incentives alone are not enough to motivate teachers in remote areas.", "仅靠经济激励不足以激励偏远地区的教师。", "2021年阅读理解", "mid", "cent", "in-", ["motivation", "stimulus", "encouragement"], ["deterrent", "discouragement"], ["financial incentive", "provide incentive", "create incentive"]),
    # m844
    ("m844", "reconcile", "/ˈrekənsaɪl/", "v.", ["调和；和解；使一致"], "to find a way to make two conflicting ideas compatible", "It is difficult to reconcile economic growth with environmental protection.", "很难调和经济增长与环境保护之间的关系。", "2022年翻译", "mid", "cile", "re-", ["harmonize", "resolve", "settle"], ["conflict", "separate"], ["reconcile differences", "reconcile with", "hard to reconcile"]),
    # m846-m848
    ("m846", "encompass", "/ɪnˈkʌmpəs/", "v.", ["包含；围绕；涵盖"], "to include a wide range of things; to surround", "The training program encompasses leadership skills, technical knowledge, and communication.", "培训项目涵盖领导技能、技术知识和沟通。", "2023年阅读理解", "mid", "compass", "en-", ["include", "comprise", "cover"], ["exclude", "omit"], ["encompass a range", "broadly encompass", "encompass all aspects"]),
    ("m847", "expedition", "/ˌekspəˈdɪʃn/", "n.", ["探险；远征；考察"], "a journey undertaken for a particular purpose such as exploration or research", "The scientific expedition to the Arctic yielded valuable climate data.", "前往北极的科学考察产生了宝贵的气候数据。", "2021年翻译", "mid", "ped", "ex-", ["journey", "voyage", "exploration"], [], ["scientific expedition", "research expedition", "organize an expedition"]),
    ("m848", "depict", "/dɪˈpɪkt/", "v.", ["描绘；描述；刻画"], "to represent by drawing or painting; to describe", "The documentary depicts the daily struggles of teachers in underfunded schools.", "这部纪录片描绘了资金不足学校中教师的日常挣扎。", "2022年阅读理解", "mid", "pict", "de-", ["portray", "describe", "illustrate"], [], ["depict life", "depict the scene", "vividly depict"]),
    # m850-m851
    ("m850", "rectify", "/ˈrektɪfaɪ/", "v.", ["纠正；矫正；整顿"], "to put right; to correct", "The school took immediate steps to rectify the errors in its admission process.", "学校立即采取步骤纠正招生过程中的错误。", "2023年翻译", "mid", "rect", "-ify", ["correct", "fix", "remedy"], ["worsen", "damage"], ["rectify the situation", "rectify errors", "immediately rectify"]),
    ("m851", "discrepancy", "/dɪˈskrepənsi/", "n.", ["差异；不一致；矛盾"], "a difference between things that should be the same", "There is a significant discrepancy between the reported figures and the actual data.", "报告的数字与实际数据之间存在显著差异。", "2021年阅读理解", "mid", "crep", "dis-", ["difference", "inconsistency", "variance"], ["agreement", "consistency"], ["significant discrepancy", "noticeable discrepancy", "discrepancy between"]),
    # m857-m858
    ("m857", "coherent", "/kəʊˈhɪərənt/", "adj.", ["连贯的；一致的；有条理的"], "logical and consistent; forming a united whole", "Students need to develop coherent arguments supported by evidence in their essays.", "学生需要在文章中提出由证据支持的连贯论点。", "2022年翻译", "mid", "her", "co-", ["logical", "consistent", "clear"], ["confused", "disjointed"], ["coherent argument", "coherent policy", "logically coherent"]),
    ("m858", "autonomy", "/ɔːˈtɒnəmi/", "n.", ["自主权；自治；自主"], "the right to govern oneself; independence", "Universities should have greater autonomy in designing their curricula.", "大学在课程设计方面应有更大的自主权。", "2023年阅读理解", "mid", "nom", "auto-", ["independence", "self-rule", "freedom"], ["subordination", "dependence"], ["academic autonomy", "grant autonomy", "institutional autonomy"]),
    # m861
    ("m861", "demographic", "/ˌdeməˈɡræfɪk/", "adj./n.", ["人口统计的；人口学的"], "relating to the structure of populations", "Demographic changes have significant implications for education planning.", "人口结构变化对教育规划有重大影响。", "2021年翻译", "mid", "graph", "demo-", ["population", "statistical"], [], ["demographic change", "demographic data", "demographic trend"]),
    # m868-m869
    ("m868", "insulate", "/ˈɪnsjuleɪt/", "v.", ["隔离；绝缘；使孤立"], "to protect from heat, cold, or noise; to isolate", "Wealth can insulate people from the realities faced by the less fortunate.", "财富可以将人与不幸者所面临的现实隔离开来。", "2022年阅读理解", "mid", "sul", "in-", ["isolate", "protect", "shield"], ["expose", "connect"], ["insulate from", "insulate against", "well insulated"]),
    ("m869", "monetary", "/ˈmʌnɪtəri/", "adj.", ["货币的；金融的；钱的"], "relating to money or currency", "The central bank adjusted its monetary policy to control inflation.", "中央银行调整了其货币政策以控制通货膨胀。", "2023年翻译", "mid", "monet", "-ary", ["financial", "economic", "fiscal"], [], ["monetary policy", "monetary system", "monetary value"]),
    # m876-m878
    ("m876", "attribute", "/əˈtrɪbjuːt/", "v./n.", ["归因于；属性；特质"], "to regard something as being caused by; a quality or characteristic", "Researchers attribute the decline in reading skills to the rise of social media.", "研究人员将阅读技能的下降归因于社交媒体的兴起。", "2021年阅读理解", "mid", "tribut", "at-", ["ascribe", "credit", "assign"], [], ["attribute to", "widely attributed", "key attribute"]),
    ("m877", "consecutive", "/kənˈsekjutɪv/", "adj.", ["连续的；连贯的"], "following one after another in order", "The team won the championship for three consecutive years.", "该队连续三年获得冠军。", "2022年翻译", "mid", "secut", "con-", ["successive", "continuous", "sequential"], ["intermittent", "sporadic"], ["consecutive years", "three consecutive", "consecutive days"]),
    ("m878", "encompass", "/ɪnˈkʌmpəs/", "v.", ["包含；围绕；涵盖"], "to include a wide range of things", "Modern education encompasses far more than traditional classroom instruction.", "现代教育远不止传统的课堂教学。", "2023年阅读理解", "mid", "compass", "en-", ["include", "cover", "contain"], ["exclude", "omit"], ["encompass all", "broadly encompass", "encompass various"]),
    # m885
    ("m885", "allegedly", "/əˈledʒɪdli/", "adv.", ["据称；据说"], "used to describe something that is said to be true but not proven", "The company allegedly manipulated test scores to improve its ranking.", "据称该公司操纵了考试成绩以提高其排名。", "2021年阅读理解", "mid", "leg", "al-", ["reportedly", "supposedly", "purportedly"], ["confirmed", "proven"], ["allegedly committed", "allegedly involved"]),
    # m888
    ("m888", "disposition", "/ˌdɪspəˈzɪʃn/", "n.", ["性格；倾向；处置"], "a person's natural qualities of mind and character", "A calm disposition is essential for teachers managing large classrooms.", "冷静的性格对于管理大班级的教师来说至关重要。", "2022年翻译", "mid", "pos", "dis-", ["temperament", "tendency", "attitude"], [], ["calm disposition", "cheerful disposition", "disposition toward"]),
    # m891
    ("m891", "impartial", "/ɪmˈpɑːʃəl/", "adj.", ["公正的；中立的；不偏不倚的"], "not favoring one side more than another; fair", "An impartial assessment of the policy reveals both strengths and weaknesses.", "对该政策的公正评估揭示了其优势和劣势。", "2023年阅读理解", "mid", "part", "im-", ["fair", "unbiased", "neutral"], ["biased", "partial"], ["impartial judgment", "impartial analysis", "remain impartial"]),
    # m894
    ("m894", "retrospect", "/ˈretrəspekt/", "n.", ["回顾；回想"], "a review of past events", "In retrospect, the decision to invest in renewable energy was wise.", "回想起来，投资可再生能源的决定是明智的。", "2021年翻译", "mid", "spect", "retro-", ["review", "reflection", "hindsight"], ["prospect"], ["in retrospect", "on retrospect", "retrospect analysis"]),
    # m896
    ("m896", "pragmatic", "/præɡˈmætɪk/", "adj.", ["务实的；实用主义的"], "dealing with things in a practical way", "A pragmatic approach to education reform focuses on achievable goals.", "务实的方法进行教育改革侧重于可实现的目标。", "2022年阅读理解", "mid", "pragm", "-atic", ["practical", "realistic", "sensible"], ["idealistic", "theoretical"], ["pragmatic approach", "pragmatic solution", "highly pragmatic"]),
    # m898
    ("m898", "deterioration", "/dɪˌtɪəriəˈreɪʃn/", "n.", ["恶化；退化；变坏"], "the process of becoming worse", "The deterioration of public schools has become a major political issue.", "公立学校的恶化已成为一个重大政治问题。", "2023年翻译", "mid", "terior", "de-", ["decline", "degradation", "worsening"], ["improvement"], ["further deterioration", "rapid deterioration", "prevent deterioration"]),
    # m901-m902
    ("m901", "plausible", "/ˈplɔːzəbl/", "adj.", ["似乎合理的；貌似可信的"], "seeming reasonable or probable", "The scientist offered a plausible theory to explain the unusual phenomenon.", "科学家提供了一个合理的理论来解释这一异常现象。", "2021年阅读理解", "mid", "plaus", "-ible", ["reasonable", "credible", "likely"], ["implausible", "unlikely"], ["plausible explanation", "plausible scenario", "sound plausible"]),
    ("m902", "inception", "/ɪnˈsepʃn/", "n.", ["开始；开端；起初"], "the establishment or beginning of something", "Since its inception in 1950, the organization has promoted education worldwide.", "自1950年成立以来，该组织一直在全球推广教育。", "2022年翻译", "mid", "cept", "in-", ["beginning", "origin", "start"], ["conclusion", "end"], ["since its inception", "from inception", "at inception"]),
    # m908-m909
    ("m908", "subsequently", "/ˈsʌbsɪkwəntli/", "adv.", ["随后；后来；接着"], "after something else has happened", "The policy was initially controversial but was subsequently accepted by the public.", "该政策最初引起争议，但随后被公众接受。", "2023年阅读理解", "mid", "sequ", "sub-", ["afterward", "later", "then"], ["previously", "earlier"], ["subsequently found", "subsequently became", "subsequently developed"]),
    ("m909", "remuneration", "/rɪˌmjuːnəˈreɪʃn/", "n.", ["报酬；薪酬；补偿"], "payment for work or services", "Teacher remuneration should reflect the importance of their role in society.", "教师的薪酬应反映他们在社会中的重要作用。", "2021年翻译", "mid", "muner", "re-", ["salary", "pay", "compensation"], [], ["remuneration package", "fair remuneration", "remuneration and benefits"]),
]

LOW_WORDS = [
    # l601-l603
    ("l601", "auditorium", "/ˌɔːdɪˈtɔːriəm/", "n.", ["礼堂；观众席；音乐厅"], "a large room for performances or events", "The graduation ceremony was held in the university auditorium.", "毕业典礼在大学礼堂举行。", "2021年翻译", "low", "aud", "-itorium", ["hall", "theater"], [], ["school auditorium", "large auditorium", "main auditorium"]),
    ("l602", "bureaucrat", "/ˈbjʊərəkræt/", "n.", ["官僚；官僚主义者"], "an official in a government department", "Bureaucrats often resist changes that might reduce their power or influence.", "官僚经常抵制可能削弱其权力或影响力的变革。", "2022年阅读理解", "low", "cracy", "bureau-", ["official", "administrator"], [], ["government bureaucrat", "faceless bureaucrat", "senior bureaucrat"]),
    ("l603", "catastrophe", "/kəˈtæstrəfi/", "n.", ["灾难；大祸；惨败"], "a sudden disaster or great misfortune", "A failure to address climate change could lead to an environmental catastrophe.", "未能应对气候变化可能导致环境灾难。", "2023年阅读理解", "low", "stroph", "cata-", ["disaster", "calamity", "tragedy"], ["blessing", "miracle"], ["environmental catastrophe", "major catastrophe", "avert a catastrophe"]),
    # l605-l607
    ("l605", "cognition", "/kɒɡˈnɪʃn/", "n.", ["认知；认识；认知能力"], "the mental process of knowing and understanding", "Research in cognition has important implications for teaching methods.", "认知研究对教学方法有重要影响。", "2021年翻译", "low", "cogn", "-ition", ["awareness", "understanding", "perception"], [], ["human cognition", "cognition and learning", "social cognition"]),
    ("l606", "commemorate", "/kəˈmeməreɪt/", "v.", ["纪念；庆祝"], "to remember and honor a person or event", "The university holds an annual ceremony to commemorate its founding.", "该大学每年举行仪式纪念其建校。", "2022年阅读理解", "low", "memor", "com-", ["honor", "celebrate", "remember"], ["forget", "ignore"], ["commemorate the anniversary", "commemorate a hero", "ceremony to commemorate"]),
    ("l607", "corporation", "/ˌkɔːpəˈreɪʃn/", "n.", ["公司；企业；法人"], "a large business or organization", "Multinational corporations have a responsibility to support local education.", "跨国公司有责任支持当地教育。", "2023年阅读理解", "low", "corpor", "-ation", ["company", "firm", "enterprise"], [], ["multinational corporation", "large corporation", "corporation tax"]),
    # l616
    ("l616", "discrimination", "/dɪˌskrɪmɪˈneɪʃn/", "n.", ["歧视；辨别力；识别"], "treating a person or group differently and unfairly", "Laws have been enacted to prevent discrimination in the workplace.", "已颁布法律防止工作场所的歧视。", "2021年阅读理解", "low", "crimin", "dis-", ["prejudice", "bias", "unfairness"], ["equality", "fairness"], ["racial discrimination", "gender discrimination", "prevent discrimination"]),
    # l619
    ("l619", "endeavor", "/ɪnˈdevə/", "n./v.", ["努力；尽力；事业"], "an attempt to achieve a goal; to try hard", "The government's endeavor to improve rural education has shown promising results.", "政府改善农村教育的努力已显示出可喜的成果。", "2022年翻译", "low", "deavor", "en-", ["effort", "attempt", "undertaking"], [], ["human endeavor", "endeavor to", "scientific endeavor"]),
    # l622-l623
    ("l622", "expedition", "/ˌekspəˈdɪʃn/", "n.", ["探险；远征；考察"], "a journey made for a specific purpose", "The research expedition collected valuable data on ocean temperatures.", "这次研究考察收集了关于海洋温度的宝贵数据。", "2023年阅读理解", "low", "ped", "ex-", ["journey", "voyage", "exploration"], [], ["scientific expedition", "research expedition", "organize an expedition"]),
    ("l623", "formation", "/fɔːˈmeɪʃn/", "n.", ["形成；构成；编队"], "the process of being formed or created", "The formation of good study habits should begin in early childhood.", "良好学习习惯的形成应从幼儿时期开始。", "2021年翻译", "low", "form", "-ation", ["creation", "development", "establishment"], ["dissolution"], ["formation of", "rock formation", "social formation"]),
    # l628-l629
    ("l628", "hierarchy", "/ˈhaɪərɑːki/", "n.", ["等级制度；层级；层次体系"], "a system in which people are ranked according to status or authority", "The corporate hierarchy can sometimes hinder innovation and creativity.", "企业等级制度有时会阻碍创新和创造力。", "2022年阅读理解", "low", "arch", "hier-", ["ranking", "pecking order", "structure"], [], ["corporate hierarchy", "social hierarchy", "strict hierarchy"]),
    ("l629", "illuminate", "/ɪˈluːmɪneɪt/", "v.", ["照亮；阐明；使光辉"], "to light up; to make something clear or easier to understand", "The study helps illuminate the complex relationship between poverty and education.", "这项研究有助于阐明贫困与教育之间的复杂关系。", "2023年翻译", "low", "lumin", "il-", ["light up", "clarify", "explain"], ["darken", "obscure"], ["illuminate the issue", "help illuminate", "beautifully illuminate"]),
    # l634-l637
    ("l634", "lucrative", "/ˈluːkrətɪv/", "adj.", ["有利可图的；赚钱的"], "producing a great deal of profit", "Many graduates are attracted to the lucrative finance industry.", "许多毕业生被利润丰厚的金融业所吸引。", "2021年阅读理解", "low", "lucr", "-ative", ["profitable", "rewarding"], ["unprofitable"], ["lucrative business", "lucrative career", "highly lucrative"]),
    ("l635", "magnify", "/ˈmæɡnɪfaɪ/", "v.", ["放大；扩大；夸大"], "to make something look larger; to exaggerate", "The media tends to magnify social problems beyond their actual scale.", "媒体往往把社会问题放大到超出其实际规模。", "2022年翻译", "low", "magn", "-ify", ["enlarge", "amplify", "exaggerate"], ["minimize", "shrink"], ["magnify the effect", "magnify the problem", "electronically magnify"]),
    ("l636", "mandate", "/ˈmændeɪt/", "n./v.", ["授权；命令；委托"], "an official order or commission to do something", "The government has a mandate from the people to reform the education system.", "政府拥有人民赋予的改革教育系统的权力。", "2023年阅读理解", "low", "mand", "-ate", ["order", "directive", "command"], [], ["government mandate", "legal mandate", "federal mandate"]),
    ("l637", "mechanism", "/ˈmekənɪzəm/", "n.", ["机制；机理；机构"], "a system of parts working together; a natural process", "The scholarship program provides a mechanism for supporting talented students from poor backgrounds.", "奖学金项目为支持来自贫困家庭的有才华学生提供了一种机制。", "2021年翻译", "low", "mech", "-anism", ["system", "process", "device"], [], ["mechanism for", "regulatory mechanism", "defense mechanism"]),
    # l640
    ("l640", "nominal", "/ˈnɒmɪnl/", "adj.", ["名义上的；微不足道的；标称的"], "in name only; very small", "The tuition fee increase was nominal compared to the rising cost of living.", "与不断上涨的生活成本相比，学费的增加是微不足道的。", "2022年阅读理解", "low", "nom", "-inal", ["titular", "symbolic", "minimal"], ["substantial", "significant"], ["nominal fee", "nominal value", "nominal increase"]),
    # l643
    ("l643", "orientation", "/ˌɔːriənˈteɪʃn/", "n.", ["方向；定向；迎新"], "the direction in which something points; introductory training", "All new students must attend the orientation program before classes begin.", "所有新生必须在开学前参加迎新活动。", "2023年翻译", "low", "orient", "-ation", ["direction", "introduction", "alignment"], [], ["orientation program", "sexual orientation", "new student orientation"]),
    # l648-l649
    ("l648", "phenomenon", "/fɪˈnɒmɪnən/", "n.", ["现象；奇迹；杰出的人"], "a fact or event that can be observed; something remarkable", "The phenomenon of grade inflation has attracted considerable attention from educators.", "分数膨胀的现象引起了教育工作者的广泛关注。", "2021年阅读理解", "low", "phenom", "-enon", ["event", "occurrence", "fact"], [], ["natural phenomenon", "social phenomenon", "cultural phenomenon"]),
    ("l649", "plausible", "/ˈplɔːzəbl/", "adj.", ["似乎合理的；貌似可信的"], "seeming reasonable or probable", "The researcher proposed a plausible explanation for the unexpected results.", "研究人员对意外结果提出了一个似乎合理的解释。", "2022年翻译", "low", "plaus", "-ible", ["reasonable", "credible", "believable"], ["implausible"], ["plausible explanation", "seem plausible", "plausible theory"]),
    # l653
    ("l653", "prestige", "/ˈprestiːdʒ/", "n.", ["威望；声望；声誉"], "widespread respect and admiration", "Graduating from a university of high prestige can open many career opportunities.", "从享有盛誉的大学毕业可以打开许多职业机会。", "2023年阅读理解", "low", "stig", "pre-", ["reputation", "status", "renown"], ["disrepute"], ["academic prestige", "high prestige", "international prestige"]),
    # l657
    ("l657", "propagate", "/ˈprɒpəɡeɪt/", "v.", ["传播；繁殖；宣传"], "to spread ideas or information; to breed", "Social media platforms propagate information at unprecedented speed.", "社交媒体平台以前所未有的速度传播信息。", "2021年翻译", "low", "propag", "-ate", ["spread", "promote", "disseminate"], ["suppress", "contain"], ["propagate ideas", "propagate rapidly", "widely propagated"]),
    # l667
    ("l667", "remnant", "/ˈremnənt/", "n.", ["残余；遗迹；零料"], "a small remaining part of something", "The educational reforms left few remnants of the old examination system.", "教育改革几乎没有留下旧考试制度的遗迹。", "2022年阅读理解", "low", "mn", "re-", ["remains", "leftover", "residue"], [], ["last remnant", "remnant of", "historical remnant"]),
    # l671-l672
    ("l671", "retrospective", "/ˌretrəˈspektɪv/", "adj.", ["回顾的；追溯的"], "looking back on or dealing with past events", "A retrospective analysis of education policy reveals significant shifts over the decades.", "对教育政策的回顾性分析揭示了数十年来的重大转变。", "2023年翻译", "low", "spect", "retro-", ["backward-looking", "retroactive"], ["prospective", "forward-looking"], ["retrospective study", "retrospective analysis", "retrospective exhibition"]),
    ("l672", "salient", "/ˈseɪliənt/", "adj.", ["显著的；突出的；跳跃的"], "most noticeable or important", "The most salient feature of the new curriculum is its emphasis on critical thinking.", "新课程最显著的特点是其对批判性思维的强调。", "2021年阅读理解", "low", "sali", "-ent", ["prominent", "noticeable", "conspicuous"], ["insignificant", "unnoticeable"], ["salient feature", "most salient", "salient point"]),
    # l674
    ("l674", "scrutiny", "/ˈskruːtəni/", "n.", ["仔细检查；审查"], "careful examination", "Government spending on education has come under increasing scrutiny.", "政府的教育支出受到了越来越多的审查。", "2022年翻译", "low", "scrut", "-iny", ["examination", "inspection", "review"], [], ["public scrutiny", "under scrutiny", "careful scrutiny"]),
    # l678-l680
    ("l678", "simultaneous", "/ˌsɪmlˈteɪniəs/", "adj.", ["同时的；同步的"], "happening or done at the same time", "The reforms were implemented in simultaneous phases across all regions.", "改革在所有地区同时分阶段实施。", "2023年阅读理解", "low", "simul", "-taneous", ["concurrent", "synchronized", "coinciding"], ["sequential", "successive"], ["simultaneous translation", "simultaneous development", "almost simultaneous"]),
    ("l679", "sophisticated", "/səˈfɪstɪkeɪtɪd/", "adj.", ["复杂的；精密的；老练的"], "having a great deal of experience and knowledge; complex", "Modern education requires sophisticated technology and well-trained teachers.", "现代教育需要复杂的技术和训练有素的教师。", "2021年翻译", "low", "sophist", "-icated", ["complex", "advanced", "refined"], ["simple", "basic"], ["sophisticated system", "highly sophisticated", "sophisticated analysis"]),
    ("l680", "sporadic", "/spəˈrædɪk/", "adj.", ["零星的；断断续续的"], "occurring irregularly or occasionally", "Despite sporadic efforts at reform, the education system remains largely unchanged.", "尽管有零星的改革努力，教育系统基本上没有变化。", "2022年阅读理解", "low", "spor", "-adic", ["occasional", "irregular", "intermittent"], ["constant", "regular"], ["sporadic outbreaks", "sporadic violence", "sporadic attempts"]),
    # l682
    ("l682", "stipulate", "/ˈstɪpjuleɪt/", "v.", ["规定；明确要求"], "to state or require as a condition", "The law stipulates that all children must attend school until the age of 16.", "法律规定所有儿童必须上学到16岁。", "2023年翻译", "low", "stipul", "-ate", ["specify", "require", "state"], [], ["legally stipulate", "stipulate that", "clearly stipulate"]),
    # l684
    ("l684", "subsidiary", "/səbˈsɪdiəri/", "n./adj.", ["子公司；附属的；辅助的"], "a company controlled by a larger one; secondary", "The tech giant acquired several subsidiary companies to expand its education division.", "这家科技巨头收购了几家子公司以扩大其教育部门。", "2021年阅读理解", "low", "sid", "sub-", ["branch", "affiliate", "subsidiary"], ["parent", "main"], ["subsidiary company", "wholly-owned subsidiary", "subsidiary role"]),
    # l687
    ("l687", "symposium", "/sɪmˈpəʊziəm/", "n.", ["研讨会；专题讨论会"], "a conference or meeting to discuss a particular subject", "The annual education symposium attracts scholars from around the world.", "年度教育研讨会吸引了来自世界各地的学者。", "2022年翻译", "low", "sympos", "-ium", ["conference", "seminar", "forum"], [], ["annual symposium", "international symposium", "academic symposium"]),
    # l689
    ("l689", "tentative", "/ˈtentətɪv/", "adj.", ["暂定的；犹豫的；试验性的"], "not certain or fixed; provisional", "The government announced tentative plans to reform the university entrance exam system.", "政府宣布了改革大学入学考试制度的暂定计划。", "2023年阅读理解", "low", "tent", "-ative", ["provisional", "preliminary", "experimental"], ["definite", "certain"], ["tentative plan", "tentative agreement", "tentative conclusion"]),
    # l692-l693
    ("l692", "trivial", "/ˈtrɪviəl/", "adj.", ["琐碎的；不重要的"], "of little value or importance", "What appears to be a trivial administrative change can significantly affect students.", "看似微不足道的行政变更可能会显著影响学生。", "2021年翻译", "low", "trivi", "-al", ["insignificant", "minor", "petty"], ["important", "significant"], ["trivial matter", "seem trivial", "far from trivial"]),
    ("l693", "unanimous", "/juːˈnænɪməs/", "adj.", ["全体一致的；一致同意的"], "in full agreement", "The board reached a unanimous decision to increase the research budget.", "董事会一致决定增加研究预算。", "2022年阅读理解", "low", "anim", "un-", ["agreed", "unified", "consensual"], ["divided", "split"], ["unanimous decision", "unanimous support", "nearly unanimous"]),
    # l700-l701
    ("l700", "versatile", "/ˈvɜːsətaɪl/", "adj.", ["多才多艺的；多功能的"], "able to adapt to many different functions or activities", "A versatile curriculum prepares students for diverse career paths.", "多样化的课程为学生准备了多种职业道路。", "2023年翻译", "low", "vers", "-atile", ["adaptable", "flexible", "multitalented"], ["limited", "inflexible"], ["versatile tool", "highly versatile", "versatile skill"]),
    ("l701", "violate", "/ˈvaɪəleɪt/", "v.", ["违反；侵犯；亵渎"], "to break or act against a law or principle", "Schools that violate safety regulations will face strict penalties.", "违反安全规定的学校将面临严厉处罚。", "2021年阅读理解", "low", "viol", "-ate", ["break", "breach", "infringe"], ["obey", "comply"], ["violate the law", "violate regulations", "violate rights"]),
    # l706-l708
    ("l706", "vulnerable", "/ˈvʌlnərəbl/", "adj.", ["脆弱的；易受伤的"], "able to be easily harmed or influenced", "Elderly people are particularly vulnerable to online fraud.", "老年人特别容易受到网络诈骗的伤害。", "2022年翻译", "low", "vulner", "-able", ["susceptible", "exposed", "defenseless"], ["resilient", "protected"], ["vulnerable to", "vulnerable groups", "most vulnerable"]),
    ("l707", "warrant", "/ˈwɒrənt/", "n./v.", ["授权令；正当理由；保证"], "a legal document; to justify or deserve", "The seriousness of the situation warrants immediate government intervention.", "局势的严重性需要政府立即介入。", "2023年阅读理解", "low", "warr", "-ant", ["justify", "merit", "authorize"], ["deny", "refuse"], ["warrant attention", "warrant investigation", "search warrant"]),
    ("l708", "accommodate", "/əˈkɒmədeɪt/", "v.", ["容纳；适应；迎合"], "to provide space for; to adapt", "The new campus can accommodate 10,000 students.", "新校园可以容纳一万名学生。", "2021年翻译", "low", "mod", "ac-", ["house", "hold", "contain"], [], ["accommodate up to", "accommodate needs", "comfortably accommodate"]),
    # l712-l714
    ("l712", "affiliate", "/əˈfɪlieɪt/", "v./n.", ["使隶属；加入；附属机构"], "to connect to a larger group; a related organization", "The research center is affiliated with the national university.", "该研究中心隶属于国家大学。", "2022年阅读理解", "low", "fili", "af-", ["associate", "connect", "link"], ["separate"], ["affiliated with", "affiliate program", "closely affiliated"]),
    ("l713", "alleviate", "/əˈliːvieɪt/", "v.", ["减轻；缓和；缓解"], "to make suffering less severe", "The new policy aims to alleviate the burden of student loans.", "新政策旨在减轻学生贷款的负担。", "2023年翻译", "low", "lev", "al-", ["reduce", "relieve", "ease"], ["worsen", "aggravate"], ["alleviate poverty", "alleviate the burden", "help alleviate"]),
    ("l714", "ambiguity", "/ˌæmbɪˈɡjuːəti/", "n.", ["歧义；模棱两可"], "the quality of being open to more than one interpretation", "The ambiguity in the regulations led to confusion among teachers.", "法规中的歧义导致了教师之间的困惑。", "2021年阅读理解", "low", "ambi", "-guity", ["vagueness", "uncertainty", "obscurity"], ["clarity", "certainty"], ["deliberate ambiguity", "avoid ambiguity", "legal ambiguity"]),
    # l716
    ("l716", "apparatus", "/ˌæpəˈreɪtəs/", "n.", ["设备；仪器；机构"], "equipment needed for an activity; a complex structure", "The laboratory apparatus needs to be upgraded to meet modern safety standards.", "实验室设备需要升级以符合现代安全标准。", "2022年翻译", "low", "parat", "ap-", ["equipment", "machinery", "device"], [], ["laboratory apparatus", "state apparatus", "gymnastic apparatus"]),
    # l722
    ("l722", "compulsory", "/kəmˈpʌlsəri/", "adj.", ["义务的；强制性的"], "required by law or rule", "Education is compulsory for all children between the ages of 6 and 15.", "6至15岁所有儿童必须接受义务教育。", "2023年阅读理解", "low", "puls", "com-", ["mandatory", "obligatory", "required"], ["optional", "voluntary"], ["compulsory education", "compulsory subject", "compulsory military service"]),
    # l726
    ("l726", "confer", "/kənˈfɜː/", "v.", ["授予；商议；给予"], "to grant or bestow; to discuss", "The board conferred an honorary degree upon the distinguished scientist.", "董事会授予这位杰出科学家荣誉学位。", "2021年翻译", "low", "fer", "con-", ["grant", "bestow", "award"], ["revoke"], ["confer a degree", "confer with", "confer an honor"]),
    # l730
    ("l730", "consolidate", "/kənˈsɒlɪdeɪt/", "v.", ["巩固；合并；加强"], "to make stronger; to combine", "The university decided to consolidate its two campuses into one.", "该大学决定将两个校区合并为一个。", "2022年阅读理解", "low", "solid", "con-", ["strengthen", "merge", "unify"], ["weaken", "divide"], ["consolidate power", "consolidate operations", "further consolidate"]),
    # l732
    ("l732", "contingent", "/kənˈtɪndʒənt/", "adj./n.", ["取决于…的；偶然的；代表团"], "dependent on something else; a group of people", "The success of the program is contingent on adequate funding.", "该项目的成功取决于充足的资金。", "2023年翻译", "low", "ting", "con-", ["dependent", "conditional", "subject to"], ["independent", "certain"], ["contingent on", "contingent upon", "contingent plan"]),
    # l736
    ("l736", "curb", "/kɜːb/", "v./n.", ["控制；抑制；限制"], "to restrain or control", "New measures were introduced to curb rising school dropout rates.", "引入了新措施来遏制不断上升的学校辍学率。", "2021年阅读理解", "low", "curb", "", ["restrain", "control", "check"], ["encourage", "promote"], ["curb inflation", "curb spending", "help curb"]),
    # l739
    ("l739", "decentralize", "/diːˈsentrəlaɪz/", "v.", ["分散；下放权力"], "to move power away from a central authority", "Many countries have decentralized their education systems to give more power to local authorities.", "许多国家将教育体制去中心化，赋予地方当局更多权力。", "2022年翻译", "low", "centr", "de-", ["distribute", "disperse", "delegate"], ["centralize", "concentrate"], ["decentralize power", "decentralize decision-making", "decentralize administration"]),
    # l741
    ("l741", "deliberate", "/dɪˈlɪbərət/", "adj./v.", ["故意的；深思熟虑的；仔细考虑"], "done on purpose; to think carefully", "The government made a deliberate effort to improve rural education.", "政府刻意努力改善农村教育。", "2023年阅读理解", "low", "liber", "de-", ["intentional", "purposeful", "calculated"], ["accidental", "random"], ["deliberate attempt", "deliberate effort", "deliberate policy"]),
    # l744
    ("l744", "discrepancy", "/dɪˈskrepənsi/", "n.", ["差异；不一致；矛盾"], "a difference between things that should be the same", "The discrepancy between urban and rural education quality remains a major challenge.", "城乡教育质量之间的差异仍然是一个重大挑战。", "2021年翻译", "low", "crep", "dis-", ["difference", "inconsistency", "gap"], ["consistency", "agreement"], ["significant discrepancy", "glaring discrepancy", "discrepancy between"]),
    # l747-l748
    ("l747", "eccentric", "/ɪkˈsentrɪk/", "adj./n.", ["古怪的；异乎寻常的"], "unconventional and slightly strange", "The eccentric professor was beloved by his students despite his unusual teaching methods.", "这位古怪的教授尽管教学方法不同寻常，但深受学生喜爱。", "2022年阅读理解", "low", "centr", "ec-", ["unconventional", "odd", "peculiar"], ["conventional", "normal"], ["eccentric behavior", "somewhat eccentric", "eccentric personality"]),
    ("l748", "empirical", "/ɪmˈpɪrɪkl/", "adj.", ["经验的；实证的"], "based on observation rather than theory", "Educational policies should be based on empirical research rather than ideology.", "教育政策应以实证研究为基础而非意识形态。", "2023年翻译", "low", "pir", "em-", ["experimental", "observational"], ["theoretical"], ["empirical evidence", "empirical research", "empirical study"]),
]


def build_word_entry(data):
    """Build a single Word entry string from tuple data."""
    (id_val, word, phonetic, pos, meanings, eng_def, example, ex_trans, ex_src,
     level, root, affix, synonyms, antonyms, collocations) = data

    # Escape single quotes
    word = word.replace("'", "\\'")
    eng_def = eng_def.replace("'", "\\'")
    example = example.replace("'", "\\'")
    ex_trans = ex_trans.replace("'", "\\'")
    root_str = f", root: '{root}'" if root else ""
    affix_str = f", affix: '{affix}'" if affix else ""
    syn_str = f", synonyms: {synonyms}" if synonyms else ""
    ant_str = f", antonyms: {antonyms}" if antonyms else ""
    col_str = f", collocations: {collocations}" if collocations else ""

    return (f"  {{ id: '{id_val}', word: '{word}', phonetic: '{phonetic}', "
            f"partOfSpeech: '{pos}', meanings: {meanings}, englishDef: '{eng_def}', "
            f"example: '{example}', exampleTranslation: '{ex_trans}', "
            f"exampleSource: '{ex_src}', level: '{level}'{root_str}{affix_str}"
            f"{syn_str}{ant_str}{col_str} }}")


# ── Build output ─────────────────────────────────────────────────

def build_file(level, words, start_id, end_id):
    """Build a complete TypeScript file."""
    level_name = {"h": "高频", "m": "中频", "l": "低频"}[level]
    level_en = {"h": "high", "m": "mid", "l": "low"}[level]
    const_name = f"WORDS_{level.upper()}{start_id}_{level.upper()}{end_id}"

    header = (
        f"// ============================================================\n"
        f"// 考研英语核心词库 - {level_name}词汇 {level}{start_id}-{level}{end_id}\n"
        f"// 补充填充空缺的{len(words)}个{level_name}考研英语词汇\n"
        f"// ============================================================\n"
        f"\n"
        f"import type {{ Word }} from './types';\n"
        f"\n"
        f"export const {const_name}: Word[] = ["
    )

    entries = ",\n".join(build_word_entry(w) for w in words)
    footer = "\n];\n"

    return header + "\n" + entries + footer


# Generate files
os.makedirs(LIB, exist_ok=True)

# Sort each level's words by ID
high_words_sorted = sorted(HIGH_WORDS, key=lambda x: int(x[0][1:]))
mid_words_sorted = sorted(MID_WORDS, key=lambda x: int(x[0][1:]))
low_words_sorted = sorted(LOW_WORDS, key=lambda x: int(x[0][1:]))

print(f"\nGenerating files:")
print(f"  high: {len(high_words_sorted)} words")
print(f"  mid: {len(mid_words_sorted)} words")
print(f"  low: {len(low_words_sorted)} words")
print(f"  total: {len(high_words_sorted) + len(mid_words_sorted) + len(low_words_sorted)}")

# Build gap fill files
h_file = build_file("h", high_words_sorted, high_words_sorted[0][0][1:],
                    high_words_sorted[-1][0][1:])
m_file = build_file("m", mid_words_sorted, mid_words_sorted[0][0][1:],
                    mid_words_sorted[-1][0][1:])
l_file = build_file("l", low_words_sorted, low_words_sorted[0][0][1:],
                    low_words_sorted[-1][0][1:])

# Write files
h_path = os.path.join(LIB, "words_h_gaps.ts")
m_path = os.path.join(LIB, "words_m_gaps.ts")
l_path = os.path.join(LIB, "words_l_gaps.ts")

with open(h_path, 'w') as f:
    f.write(h_file)
with open(m_path, 'w') as f:
    f.write(m_file)
with open(l_path, 'w') as f:
    f.write(l_file)

print(f"\nWritten:")
print(f"  {h_path}")
print(f"  {m_path}")
print(f"  {l_path}")

# Now generate import statements and array concatenation
print("\n" + "=" * 60)
print("Add these imports to words.ts:")
print("=" * 60)
print(f"import {{ WORDS_H_GAPS }} from './words_h_gaps';")
print(f"import {{ WORDS_M_GAPS }} from './words_m_gaps';")
print(f"import {{ WORDS_L_GAPS }} from './words_l_gaps';")
print()
print("And add to the ALL_WORDS array:")
print("  ...WORDS_H_GAPS,")
print("  ...WORDS_M_GAPS,")
print("  ...WORDS_L_GAPS,")
