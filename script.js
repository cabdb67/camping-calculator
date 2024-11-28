// Configuration des saisons et des prix
function getConfig() {
    return JSON.parse(localStorage.getItem('campingConfig')) || {
        saisons: {
            BASSE: {
                debut: '01-01',
                fin: '06-30',
                prixAdulte: 7,
                prixEnfant: 4
            },
            MOYENNE: {
                debut: '07-01',
                fin: '07-14',
                prixAdulte: 9,
                prixEnfant: 5
            },
            HAUTE: {
                debut: '07-15',
                fin: '08-31',
                prixAdulte: 12,
                prixEnfant: 6
            }
        },
        services: {
            electricite: 6,
            vehicule: 3,
            animal: 2
        }
    };
}

// Fonction pour déterminer la saison en fonction de la date
function getSaison(date) {
    const config = getConfig();
    const dateObj = new Date(date);
    const moisJour = `${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
    if (moisJour >= config.saisons.HAUTE.debut && moisJour <= config.saisons.HAUTE.fin) {
        return config.saisons.HAUTE;
    } else if (moisJour >= config.saisons.MOYENNE.debut && moisJour <= config.saisons.MOYENNE.fin) {
        return config.saisons.MOYENNE;
    } else {
        return config.saisons.BASSE;
    }
}

// Calcul du nombre de jours entre deux dates
function getNombreJours(dateDebut, dateFin) {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const diffTime = Math.abs(fin - debut);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calcul du prix total
function calculerPrix() {
    const config = getConfig();
    const dateArrivee = document.getElementById('dateArrivee').value;
    const dateDepart = document.getElementById('dateDepart').value;
    const nbAdultes = parseInt(document.getElementById('adultes').value);
    const nbEnfants = parseInt(document.getElementById('enfants').value);
    
    if (!dateArrivee || !dateDepart || dateArrivee >= dateDepart) {
        alert('Veuillez vérifier vos dates de séjour');
        return;
    }

    const nombreJours = getNombreJours(dateArrivee, dateDepart);
    const saison = getSaison(dateArrivee);
    
    // Calcul du prix de base
    const prixBase = (nbAdultes * saison.prixAdulte + nbEnfants * saison.prixEnfant) * nombreJours;
    
    // Calcul des services supplémentaires
    let prixServices = 0;
    if (document.getElementById('electricite').checked) {
        prixServices += config.services.electricite * nombreJours;
    }
    if (document.getElementById('vehicule').checked) {
        prixServices += config.services.vehicule * nombreJours;
    }
    if (document.getElementById('animal').checked) {
        prixServices += config.services.animal * nombreJours;
    }

    // Affichage des résultats
    document.getElementById('prixBase').textContent = prixBase.toFixed(2) + '€';
    document.getElementById('prixServices').textContent = prixServices.toFixed(2) + '€';
    document.getElementById('prixTotal').textContent = (prixBase + prixServices).toFixed(2) + '€';
    document.getElementById('resultat').classList.remove('hidden');
}

// Écouteur d'événement pour le formulaire
document.getElementById('devisForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculerPrix();
});
