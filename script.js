// Configuration des saisons et des prix
function getConfig() {
    return JSON.parse(localStorage.getItem('campingConfig')) || {
        saisons: {
            PRINTEMPS: {
                debut: '03-20',
                fin: '06-20',
                prixAdulte: 8,
                prixEnfant: 4
            },
            ETE: {
                debut: '06-21',
                fin: '09-20',
                prixAdulte: 12,
                prixEnfant: 6
            },
            AUTOMNE: {
                debut: '09-21',
                fin: '12-20',
                prixAdulte: 8,
                prixEnfant: 4
            },
            HIVER: {
                debut: '12-21',
                fin: '03-19',
                prixAdulte: 7,
                prixEnfant: 3.5
            }
        },
        services: {
            electricite: 6,
            vehicule: 3,
            animal: 2
        },
        forfaits: {
            weekend: {
                duree: 2,
                reduction: 10,
                electriciteIncluse: true
            },
            semaine: {
                duree: 7,
                reduction: 15,
                electriciteIncluse: true
            },
            quinzaine: {
                duree: 14,
                reduction: 20,
                electriciteIncluse: true
            }
        }
    };
}

// Fonction pour déterminer la saison en fonction de la date
function getSaison(date) {
    const config = getConfig();
    const dateObj = new Date(date);
    const moisJour = `${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
    // Gestion spéciale pour l'hiver qui chevauche deux années
    if (moisJour >= config.saisons.HIVER.debut || moisJour <= config.saisons.HIVER.fin) {
        return config.saisons.HIVER;
    } else if (moisJour >= config.saisons.PRINTEMPS.debut && moisJour <= config.saisons.PRINTEMPS.fin) {
        return config.saisons.PRINTEMPS;
    } else if (moisJour >= config.saisons.ETE.debut && moisJour <= config.saisons.ETE.fin) {
        return config.saisons.ETE;
    } else {
        return config.saisons.AUTOMNE;
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
    const forfaitChoisi = document.querySelector('input[name="forfait"]:checked').value;
    
    if (!dateArrivee || !dateDepart || dateArrivee >= dateDepart) {
        alert('Veuillez vérifier vos dates de séjour');
        return;
    }

    const nombreJours = getNombreJours(dateArrivee, dateDepart);
    const saison = getSaison(dateArrivee);
    
    // Calcul du prix de base
    let prixBase = (nbAdultes * saison.prixAdulte + nbEnfants * saison.prixEnfant) * nombreJours;
    
    // Application du forfait si sélectionné
    if (forfaitChoisi !== 'aucun') {
        const forfait = config.forfaits[forfaitChoisi];
        if (nombreJours === forfait.duree) {
            // Appliquer la réduction du forfait
            prixBase = prixBase * (1 - forfait.reduction / 100);
        } else {
            alert('La durée de votre séjour ne correspond pas au forfait sélectionné');
            return;
        }
    }
    
    // Calcul des services supplémentaires
    let prixServices = 0;
    if (document.getElementById('electricite').checked && 
        !(forfaitChoisi !== 'aucun' && config.forfaits[forfaitChoisi].electriciteIncluse)) {
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
