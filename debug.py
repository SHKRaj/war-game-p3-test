data = """
"First Air Wing
1834 Multirole F-35A/B/C [Lev. 5 | Gen. 5.25] [Atk: 5 | Def: ], 

Second Air Wing
15 Air Supremacy NGAD [Lev. 6 | Gen. 6] [Atk:  | Def: ], 

Third Air Wing
8 Multirole F/A-XX [Lev. 6 | Gen. 6] [Atk:  | Def: ], 
43 Air Supremacy F-15EX [Lev. 5 | Gen. 4.5] [Atk:  | Def: ], 
129 Multirole F-15 (various) [Lev. 4 | Gen. 4] [Atk:  | Def: ], 

Home Stock
36 Air Supremacy F-22 Raptor [Lev. 6 | Gen. 5.5] [Atk:  | Def: ], 
1100 Multirole F-16 (latest blocks) [Lev. 4 | Gen. 4] [Atk:  | Def: ], 
600 Multirole F/A-18 Super Hornet [Lev. 5 | Gen. 4.5] [Atk:  | Def: ], 
41 Ground Attack B-21 Raider Stealth Bomber [Lev. 6 | Gen. 6] [Atk:  | Def: ], 
76 Ground Attack B-52 Stratofortress Bomber  [Lev. 4 | Gen. 3] [Atk:  | Def: ], 
25 Ground Attack B-1 Lancer Bomber [Lev. 4 | Gen. 4] [Atk:  | Def: ], 
10 Multirole SR-72 Hypersonic UAV [Lev. 6 | Gen. 6] [Atk:  | Def: ], 
51 Airborne Warning AWAC Craft [Lev. 1 | Gen. 2] [Atk:  | Def: ], 
31 Airborne Warning AWAC Craft X [Lev. 4 | Gen. 4] [Atk:  | Def: ], 
732 Unmanned EW UAV [Lev. 2 | Gen. 2] [Atk:  | Def: ], 
221 Recon Reconnaissance Craft [Lev. 1 | Gen. 2] [Atk:  | Def: ], 
162 Unmanned Reconaissance UAV [Lev. 1 | Gen. 2] [Atk:  | Def: ], 
65 Short-Range Air Defense A [Lev. 3 | Gen. 2] [Atk:  | Def: ], 
367 Long-Range Air Defense B [Lev. 4 | Gen. 3] [Atk:  | Def: ], 
959 Anti-Ballistic Air Defense C [Lev. 5 | Gen. 4] [Atk:  | Def: ], 
175 Anti-Hypersonic Air Defense D [Lev. 6 | Gen. 5] [Atk:  | Def: ], 
600 Unmanned Refueling Tankers [Lev. 1 | Gen. 2] [Atk:  | Def: ], "
"""

# Split by double line breaks first — sections
sections = [s.strip() for s in data.split("\n\n") if s.strip()]

for section in sections:
    # Each section starts with a title, followed by entries
    lines = [line.strip() for line in section.split("\n") if line.strip()]
    section_title = lines[0]
    entries = lines[1:]

    print(f"=== {section_title} ===")
    for entry in entries:
        print(f" - {entry}")
