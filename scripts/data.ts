import QuizQuestion from "@/types/QuizQuestion"

const quizQuestions: QuizQuestion[] = [
    {
        "classId": "calcolatori",
        "question": "Sia dato un disco fisso con settori da 512 byte e 32 settori per traccia Tseek=23ms, RPM=5200; bitrate pari a 1MB/s; Si vogliono leggere 512 byte nel caso di organizzazione sequenziale e random quali sono i tempi di lettura (approssimati al ms):",
        "options": [
            "A. 25 ms ; 27 ms",
            "B. 29 ms ; 29 ms",
            "C. 30 ms ; 31 ms",
            "D. 28 ms ; 30 ms"
        ],
        "answer": [1],
        "sectionId": "dischi"
    },
    {
        "classId": "calcolatori",
        "question": "Quale di queste configurazioni raid minimizza il rischio di perdere dati In seguito alla rottura di uno o Più dischi aumentando inoltre le prestazioni nel caso di letture simultanee di più dati ma massimizzandolo",
        "options": [
            "A. raid 0",
            "B. raid 5",
            "C. raid 1",
            "D. raid 6"
        ],
        "answer": [2],
        "sectionId": "dischi"
    },
    {
        "classId": "calcolatori",
        "question": "Il tempo di seek medio di un disco fisso:",
        "options": [
            "A. dipende dal tipo di software utilizzato e dalla gestione dei file",
            "B. è influenzato dalla velocità di trasferimento dei dati attraverso il bus",
            "C. dipende dalle dimensioni della cache del disco e dalla sua gestione",
            "D. è un parametro del disco che dipende dalla meccanica con cui è stato realizzato"
        ],
        "answer": [3],
        "sectionId": "dischi"
    },
    {
        "classId": "calcolatori",
        "question": "La suddivisione in zone per avere un numero di settori variabile dipendente dalla circonferenza della traccia in cui si trovano consente:",
        "options": [
            "A. di migliorare la velocità di lettura e scrittura, sfruttando la diversa densità dei settori sulle tracce esterne rispetto a quelle interne",
            "B. di ridurre la capacità di memorizzazione del disco, con un effetto negativo sulla quantità totale di dati che possono essere salvati",
            "C. di incrementare la capacità di memorizzazione del disco rispetto a una struttura con il numero di settori per traccia fissato",
            "D. di ridurre il tempo di seek, grazie alla maggiore distribuzione uniforme delle informazioni nelle tracce"
        ],
        "answer": [2],
        "sectionId": "dischi"
    },
    {
        "classId": "calcolatori",
        "question": "In un disco fisso per cilindro si intende:",
        "options": [
            "A. la zona di un piatto dove si trovano tracce equidistanti dal centro",
            "B. l'insieme sui vari piatti di tutte le tracce equidistanti dal centro",
            "C. l'insieme dei settori in un piatto",
            "D. l'insieme delle tracce in un piatto"
        ],
        "answer": [1],
        "sectionId": "dischi"
    },
    {
        "classId": "calcolatori",
        "question": "L’organizzazione logica delle celle di memoria nei dischi SSD prevede rispettivamente(dal più piccolo al più grande):",
        "options": [
            "A. Bitlines,Pagine,Blocchi,Piani",
            "B. Piani, Blocchi, Pagine, Bitlines",
            "C. Blocchi, Piani, Pagine, Bitlines",
            "D. Bitlines, Blocchi, Piani, Pagine"
        ],
        "answer": [0],
        "sectionId": "dischi"
    },
    {
        "classId": "calcolatori",
        "question": "Sia dato un disco fisso con settori da 512 byte e 32 settori per traccia Tseek=20ms, RPM=3600; bitrate pari a 1MB/s; Si vogliono leggere 64 Kbyte nel caso di organizzazione sequenziale e random quali sono i tempi di lettura:",
        "options": [
            "A. 0,05 sec ; 3,0 sec",
            "B. 0,09 sec ; 3,5 sec",
            "C. 0,07 sec ; 3,3 sec",
            "D. 0,11 sec ; 3,7 sec"
        ],
        "answer": [3],
        "sectionId": "dischi"
    },
    {
        "classId": "calcolatori",
        "question": "Nei dischi magnetici a registrazione perpendicolare:",
        "options": [
            "A. La capacità di memorizzazione risulta maggiore di quelli tradizionali a registrazione longitudinale poiché lo spazio occupato dalle particelle polarizzate è inferiore",
            "B. La capacità di memorizzazione è inferiore rispetto ai dischi a registrazione longitudinale, a causa di una maggiore dispersione delle particelle magnetiche",
            "C. La capacità di memorizzazione risulta uguale rispetto ai dischi a registrazione longitudinale, con differenze solo in termini di tecnologia di registrazione",
            "D. La velocità di lettura è inferiore rispetto ai dischi a registrazione longitudinale, a causa delle caratteristiche fisiche del disco e della densità di memorizzazione"
        ],
        "answer": [0],
        "sectionId": "dischi"
    },
    {
        "classId": "calcolatori",
        "question": "Sia dato un disco fisso con settori da 512 byte e 32 settori per traccia Tseek=10ms, RPM=5200; bitrate pari a 5MB/s; Si vogliono leggere 256 Kbyte nel caso di organizzazione sequenziale e random quali sono i tempi di lettura:",
        "options": [
            "A. 0,15 sec ; 8,12 sec",
            "B. 0,10 sec ; 5,8 sec",
            "C. 0,12 sec ; 7,0 sec",
            "D. 0,18 sec ; 9,5 sec"
        ],
        "answer": [0],
        "sectionId": "dischi"
    },
    {
        "classId": "calcolatori",
        "question": "In un disco fisso il tempo di dato è:",
        "options": [
            "A. il tempo per posizionare la testina",
            "B. il tempo per scrivere i dati",
            "C. il tempo per leggere serialmente i dati",
            "D. il tempo per spostare il braccio su una nuova traccia"
        ],
        "answer": [2],
        "sectionId": "dischi"
    },
    {
        "classId": "calcolatori",
        "question": "In un disco fisso il tempo di latenza è:",
        "options": [
            "A. il tempo necessario affinché il braccio del disco si sposti sulla nuova traccia richiesta",
            "B. il tempo per posizionare la testina sul settore opportuno all'interno della traccia",
            "C. il tempo complessivo richiesto per leggere i dati, includendo l’accesso al settore corretto",
            "D. il tempo totale richiesto per scrivere i dati"
        ],
        "answer": [1],
        "sectionId": "dischi"
    },
    {
        "classId": "calcolatori",
        "question": "La generica struttura di un disco fisso prevede",
        "options": [
            "A. una struttura a strati in cui i settori sono suddivisi in blocchi",
            "B. uno o più piatti ciascuno suddiviso in settori a loro volta suddivisi in tracce circolari",
            "C. uno o più piatti ciascuno suddiviso in tracce circolari a loro volta suddivise in settori",
            "D. uno o più piatti ciascuno suddiviso solo in tracce"
        ],
        "answer": [2],
        "sectionId": "dischi"
    },
    {
        "classId": "calcolatori",
        "question": "In un disco SSD l’unità atomica ovvero il più piccolo elemento modificabile in scrittura è rappresentata da:",
        "options": [
            "A. Pagine",
            "B. Blocco",
            "C. Bitlines",
            "D. Piani"
        ],
        "answer": [1],
        "sectionId": "dischi"
    },
    {
        "classId": "calcolatori",
        "question": "II processo di scrittura in un disco fisso prevede:",
        "options": [
            "A. che il solenoide sulla testina del disco sia percorso da corrente la quale polarizzi le particelle di materiale ferromagnetico orientandole nella stessa direzione della corrente",
            "B. che la testina venga spostata sulla traccia desiderata",
            "C. che il solenoide sulla testina del disco sia percorso da corrente la quale senza alcun tipo di contatto con il piatto polarizzi le particelle di materiale ferromagnetico orientandole in verso opposto alla corrente",
            "D. che il disco venga riscaldato prima della scrittura"
        ],
        "answer": [2],
        "sectionId": "dischi"
    }
]

export default quizQuestions