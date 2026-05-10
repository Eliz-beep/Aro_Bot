module.exports = {
    // Lista de personajes con links directos corregidos
    arros: [
        { nombre: "Arrow", rareza: "Comun", imagen: "https://i.imgur.com/QrGb2w6.png" },
        { nombre: "Aro-Bot", rareza: "Comun", imagen: "https://i.imgur.com/gwmpC25.png" },
        { nombre: "Aro-Aplastado", rareza: "Comun", imagen: "https://i.imgur.com/dOI44TD.png" },
        { nombre: "Aro-Light", rareza: "Comun", imagen: "https://i.imgur.com/4qWeiUh.png" },
        { nombre: "InverseArrow", rareza: "Comun", imagen: "https://i.imgur.com/5cyD3tv.png" },
        { nombre: "PixelArrow", rareza: "Uncomun", imagen: "https://i.imgur.com/uaEIK4e.png" },
        { nombre: "ArrowHD", rareza: "Uncomun", imagen: "https://i.imgur.com/m7vM2vY.png" },
        { nombre: "AlienArrow", rareza: "Uncomun", imagen: "https://i.imgur.com/JogMEcY.png" },
        { nombre: "Arrow-Sus", rareza: "Uncomun", imagen: "https://i.imgur.com/17Vu8BY.png" },
        { nombre: "BigArrow", rareza: "Uncomun", imagen: "https://i.imgur.com/CnrvQen.png" },
        { nombre: "RareArrow", rareza: "Uncomun", imagen: "https://i.imgur.com/TUNimDA.png" },
        { nombre: "RetroArrow", rareza: "Raro", imagen: "https://i.imgur.com/77cCXGZ.png" },
        { nombre: "EmbossArrow", rareza: "Raro", imagen: "https://i.imgur.com/WhsL7nK.png" },
        { nombre: "ArrowIRL", rareza: "Raro", imagen: "https://i.imgur.com/SHQj2tM.png" },
        { nombre: "Brightrrow", rareza: "Raro", imagen: "https://i.imgur.com/YLK9Sgb.png" },
        { nombre: "Mimorrow", rareza: "Raro", imagen: "https://i.imgur.com/77cCXGZ.png" },
        { nombre: "ArrowDerretido", rareza: "Raro", imagen: "https://i.imgur.com/wtldl3D.png" },
        { nombre: "Arrow Distorsionado", rareza: "Legendario", imagen: "https://i.imgur.com/DMyk5Em.png" },
        { nombre: "ArrowBlur", rareza: "Legendario", imagen: "https://i.imgur.com/BQJ7arF.png" },
        { nombre: "ArrowDistorsion", rareza: "Legendario", imagen: "https://i.imgur.com/KuFU89e.png" },
        { nombre: "FireRrow", rareza: "Legendario", imagen: "https://i.imgur.com/EGaE7A2.png" },
        { nombre: "MetalArrow", rareza: "Legendario", imagen: "https://i.imgur.com/QX0Rcg2.png" },
        { nombre: "AngryArrow", rareza: "Mitico", imagen: "https://i.imgur.com/Q0hjwiY.png" },
        { nombre: "glitch Arrow", rareza: "Mitico", imagen: "https://i.imgur.com/Xw2jxFM.png" },
        { nombre: "W_BArrow", rareza: "Mitico", imagen: "https://i.imgur.com/QX0Rcg2.png" },
        { nombre: "SuperArrow", rareza: "Mitico", imagen: "https://i.imgur.com/iYxSmfg.png" },
        { nombre: "Nonerrow", rareza: "UltraRaro", imagen: "https://i.imgur.com/5d3DBrc.png" },     
        { nombre: "OldArrow", rareza: "UltraRaro", imagen: "https://i.imgur.com/rl1y5ee.png" }                                                    
    ],
    // Configuración de rarezas: XP, Probabilidad (Peso) y Color del Embed
    rarezas: {
        "Comun":      { xp: 25,   prob: 700,  color: "#95a5a6" },
        "Uncomun":    { xp: 50,   prob: 600,  color: "#2ecc71" },
        "Raro":       { xp: 100,  prob: 500,  color: "#3498db" },
        "Epico":      { xp: 250,  prob: 400,  color: "#9b59b6" },
        "Legendario": { xp: 500,  prob: 300,   color: "#f1c40f" },
        "Mitico":     { xp: 1000, prob: 100,   color: "#e74c3c" },
        "UltraRaro":  { xp: 5000, prob: 40,    color: "#e91e63" }
    }
};