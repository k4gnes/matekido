# TODO - Lesson reorganization

## Cél

A feladatok szerkezetének átalakítása úgy, hogy a Matekidő
első osztálytól akár nyolcadik osztályig könnyen bővíthető legyen.

---

# 1. Metaadatok

Minden lecke kapjon egységes metaadatokat.

Példa:

{
    "id": "neighbours-dual",
    "title": "Számszomszédok",
    "grades": [1,2],
    "category": "numbers",
    "skill": "neighbours",
    "difficulty": 1
}

---

# 2. Kategóriák

## Numbers (Számok)

- [ ] Számszomszédok
- [ ] Nagyobb-kisebb
- [ ] Hiányzó szám
- [ ] Számsorok
- [ ] Számrendezés
- [ ] Páros-páratlan
- [ ] Helyi érték
- [ ] Kerekítés (később)

## Operations (Műveletek)

- [ ] Összeadás
- [ ] Kivonás
- [ ] Vegyes műveletek
- [ ] Hiányzó tag
- [ ] Hiányzó művelet
- [ ] Tízes átlépés

## Multiplication & Division

- [ ] Szorzás
- [ ] Osztás
- [ ] Hiányzó tényező

## Measurement

- [ ] Hosszúság
- [ ] Tömeg
- [ ] Űrtartalom

## Time

- [ ] Óra
- [ ] Perc
- [ ] Naptár

## Money

- [ ] Érmék
- [ ] Bankjegyek
- [ ] Vásárlás

## Geometry

- [ ] Alakzatok
- [ ] Kerület
- [ ] Terület

## Word Problems

- [ ] Egylépéses
- [ ] Kétlépéses

---

# 3. Skill rendszer

Minden lecke tartozzon egy skillhez.

Példák:

- neighbours
- comparison
- ordering
- missing-number
- addition
- subtraction
- multiplication
- division
- place-value
- fractions
- percentage

---

# 4. Difficulty

difficulty:

1 = alap

2 = gyakorló

3 = haladó

4 = mester

---

# 5. Grade

A lecke több évfolyamhoz is tartozhat.

Példák:

grades: [1]

grades: [1,2]

grades: [2,3]

---

# 6. Menü átalakítása

Most:

1. osztály
    lecke
    lecke
    lecke

↓

Később:

1. osztály

Számok
    Számszomszédok
    Nagyobb-kisebb
    Hiányzó szám

Műveletek
    Összeadás
    Kivonás

---

# 7. Statisztika

Ne leckéket tároljunk.

Hanem skilleket.

Például:

Számszomszédok

12 ✔

3 ✖

---

# 8. Adaptív gyakorlás

Később ezekből épül fel.

"Ajánlott gyakorlás"

↓

Gyengébb skillek

↓

Ajánlott játékok

---

# 9. Hosszú távú cél

Ne feladatgyűjtemény legyen.

Hanem készségalapú matematikai gyakorlórendszer.

A feladat csak egy megvalósítás.

A skill az igazi tudáselem.

---

# Fejlesztési elvek

✔ Egy feladat több évfolyamhoz is tartozhat.

✔ Egy skillhez több különböző játék tartozhat.

✔ A statisztika a skillt mérje, ne a konkrét játékot.

✔ Az adaptív rendszer skillek alapján ajánljon.

✔ A menü is készségek szerint épüljön fel.