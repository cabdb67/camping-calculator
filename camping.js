// Configuration des tarifs
function getConfig() {
    return JSON.parse(localStorage.getItem('campingConfig')) || {
        emplacementNu: {
            forfaitBase: 20,
            enfants: {
                "0-2": 0,
                "3-12": 5,
                "13-17": 7
            },
            personneSupplementaire: 10,
            electricite: 5,
            chien: 2,
            randonneur: 8,
            rechargeVelo: 2
        }
    };
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Cacher les messages au démarrage
    document.getElementById('messageEmplacements').classList.add('hidden');
    document.getElementById('prixParEmplacement').classList.add('hidden');
    document.getElementById('resultat').classList.add('hidden');
});

// Calcul du nombre de jours
function getNombreJours(dateDebut, dateFin) {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const diffTime = Math.abs(fin - debut);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Formatage de la date
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
}

// Gestion de l'option randonneur
document.getElementById('randonneur').addEventListener('change', function(e) {
    const optionsStandard = document.getElementById('options-standard');
    if (this.checked) {
        optionsStandard.classList.add('hidden');
        document.getElementById('adultes').value = '1';
        document.getElementById('enfants0_2').value = '0';
        document.getElementById('enfants3_12').value = '0';
        document.getElementById('enfants13_17').value = '0';
        document.getElementById('personnesSupp').value = '0';
    } else {
        optionsStandard.classList.remove('hidden');
    }
    calculerPrix();
});

// Calcul du prix total
function calculerPrix() {
    const config = getConfig();
    const dateArrivee = document.getElementById('dateArrivee').value;
    const dateDepart = document.getElementById('dateDepart').value;
    const estRandonneur = document.getElementById('randonneur').checked;
    const electricite = document.getElementById('electricite').checked;
    const rechargeVelo = document.getElementById('rechargeVelo').checked;
    const nbChiens = parseInt(document.getElementById('chiens').value) || 0;
    
    if (!dateArrivee || !dateDepart || dateArrivee >= dateDepart) {
        alert('Veuillez vérifier vos dates de séjour');
        return;
    }

    if (nbChiens > 2) {
        alert('Le nombre maximum de chiens autorisés est de 2');
        document.getElementById('chiens').value = '2';
        return;
    }

    const nombreJours = getNombreJours(dateArrivee, dateDepart);
    let prixTotal = 0;
    let prixBase = 0, prixEnfants = 0, prixPersonnesSupp = 0, prixElectricite = 0, prixRechargeVelo = 0, prixChiens = 0, prixTaxe = 0;
    let nbAdultes = 0;
    
    // Affichage des dates
    document.getElementById('dateDebutSejour').textContent = formatDate(dateArrivee);
    document.getElementById('dateFinSejour').textContent = formatDate(dateDepart);
    document.getElementById('nombreNuits').textContent = nombreJours;
    
    // Cacher les messages de recommandation par défaut
    document.getElementById('messageEmplacements').classList.add('hidden');
    document.getElementById('prixParEmplacement').classList.add('hidden');
    
    if (estRandonneur) {
        // Pour un randonneur : tarif unique + options
        prixBase = config.emplacementNu.randonneur * nombreJours;
        prixTotal = prixBase;
        nbAdultes = 1; // Un seul adulte pour le tarif randonneur
    } else {
        // Calcul standard
        nbAdultes = parseInt(document.getElementById('adultes').value) || 0;
        const nbEnfants0_2 = parseInt(document.getElementById('enfants0_2').value) || 0;
        const nbEnfants3_12 = parseInt(document.getElementById('enfants3_12').value) || 0;
        const nbEnfants13_17 = parseInt(document.getElementById('enfants13_17').value) || 0;
        const nbPersonnesSupp = parseInt(document.getElementById('personnesSupp').value) || 0;

        // Calcul du nombre total de personnes
        const totalPersonnes = nbAdultes + nbEnfants0_2 + nbEnfants3_12 + nbEnfants13_17 + nbPersonnesSupp;
        const totalAdultes = nbAdultes + nbPersonnesSupp;
        
        // Pour 7 personnes (6 adultes + 1 enfant) :
        // 1. Nombre d'emplacements = Math.ceil(7/6) = 2 (max 6 personnes par emplacement)
        // 2. Personnes incluses = 2 * 2 = 4 (2 personnes par forfait)
        // 3. Personnes supplémentaires adultes = nbAdultes - personnes incluses
        const nbEmplacements = Math.ceil(totalPersonnes / 6);
        const personnesInclusesDansForfaits = nbEmplacements * 2;
        
        // On compte d'abord les adultes supplémentaires
        const adultesSupplementaires = Math.max(0, totalAdultes - personnesInclusesDansForfaits);
        
        // Prix des forfaits (1 forfait par emplacement)
        prixBase = config.emplacementNu.forfaitBase * nombreJours * nbEmplacements;
        
        // Calcul du prix des enfants (tous les enfants sont comptés au tarif enfant)
        prixEnfants = (
            nbEnfants0_2 * config.emplacementNu.enfants["0-2"] +
            nbEnfants3_12 * config.emplacementNu.enfants["3-12"] +
            nbEnfants13_17 * config.emplacementNu.enfants["13-17"]
        ) * nombreJours;
        
        // Prix des personnes supplémentaires (uniquement les adultes)
        prixPersonnesSupp = adultesSupplementaires * config.emplacementNu.personneSupplementaire * nombreJours;

        prixTotal = prixBase + prixEnfants + prixPersonnesSupp;
        
        // Afficher le détail des forfaits
        const detailForfaits = document.getElementById('detail-forfaits');
        if (nbEmplacements > 1 || adultesSupplementaires > 0) {
            document.getElementById('nbEmplacements').textContent = nbEmplacements;
            document.getElementById('prixDivise').textContent = (prixTotal / nbEmplacements).toFixed(2) + '€';
            document.getElementById('messageEmplacements').classList.remove('hidden');
            document.getElementById('prixParEmplacement').classList.remove('hidden');
            
            // Afficher le détail des forfaits et personnes supplémentaires
            detailForfaits.classList.remove('hidden');
            const totalEnfants = nbEnfants0_2 + nbEnfants3_12 + nbEnfants13_17;
            document.getElementById('detailForfaits').textContent = 
                `${nbEmplacements} forfaits (${personnesInclusesDansForfaits} pers. incluses) + ${adultesSupplementaires} adultes supp. + ${totalEnfants} enfant(s)`;
        } else {
            detailForfaits.classList.add('hidden');
        }
    }
    
    // Ajout du prix de l'électricité
    if (electricite) {
        prixElectricite = config.emplacementNu.electricite * nombreJours;
        prixTotal += prixElectricite;
    }

    // Ajout du prix de la recharge vélo
    if (rechargeVelo) {
        prixRechargeVelo = config.emplacementNu.rechargeVelo * nombreJours;
        prixTotal += prixRechargeVelo;
    }

    // Ajout du prix des chiens
    if (nbChiens > 0) {
        prixChiens = nbChiens * config.emplacementNu.chien * nombreJours;
        prixTotal += prixChiens;
    }

    // Calcul de la taxe de séjour (0.22€ par nuit et par adulte)
    prixTaxe = 0.22 * nombreJours * nbAdultes;
    prixTotal += prixTaxe;

    // Affichage des détails
    document.getElementById('prixBase').textContent = prixBase.toFixed(2) + '€';
    document.getElementById('prixEnfants').textContent = prixEnfants.toFixed(2) + '€';
    document.getElementById('prixPersonnesSupp').textContent = prixPersonnesSupp.toFixed(2) + '€';
    document.getElementById('prixElectricite').textContent = prixElectricite.toFixed(2) + '€';
    document.getElementById('prixRechargeVelo').textContent = prixRechargeVelo.toFixed(2) + '€';
    document.getElementById('prixChiens').textContent = prixChiens.toFixed(2) + '€';
    document.getElementById('prixTaxe').textContent = prixTaxe.toFixed(2) + '€';
    document.getElementById('prixTotal').textContent = prixTotal.toFixed(2) + '€';

    // Afficher le résultat
    document.getElementById('resultat').classList.remove('hidden');
}

// Écouteur d'événement pour le formulaire
document.getElementById('campingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculerPrix();
});
