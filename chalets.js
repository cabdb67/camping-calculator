function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getSaison(date) {
    const month = new Date(date).getMonth() + 1; // getMonth() returns 0-11
    
    if ((month >= 1 && month <= 3) || (month >= 10 && month <= 12)) {
        return 'basseSaison';
    } else if ((month >= 4 && month <= 6) || month === 9) {
        return 'moyenneSaison';
    } else {
        return 'hauteSaison';
    }
}

function getNomSaison(saisonCode) {
    const saisons = {
        'basseSaison': 'Basse Saison',
        'moyenneSaison': 'Moyenne Saison',
        'hauteSaison': 'Haute Saison'
    };
    return saisons[saisonCode];
}

function calculerPrix() {
    // Récupérer la configuration
    const config = JSON.parse(localStorage.getItem('chaletConfig'));
    if (!config) {
        afficherErreur("La configuration des prix n'a pas été trouvée.");
        return;
    }

    // Récupérer les valeurs du formulaire
    const dateArrivee = document.getElementById('dateArrivee').value;
    const dateDepart = document.getElementById('dateDepart').value;
    const typeChalet = document.querySelector('input[name="typeChalet"]:checked').value;
    const nbPersonnes = parseInt(document.getElementById('nbPersonnes').value);
    const optionMenage = document.getElementById('optionMenage').checked;
    const nbDraps = parseInt(document.getElementById('nbDraps').value) || 0;
    const nbChiens = parseInt(document.getElementById('nbChiens').value) || 0;

    // Validation des dates
    if (!dateArrivee || !dateDepart) {
        afficherErreur("Veuillez sélectionner les dates de séjour.");
        return;
    }

    const dateA = new Date(dateArrivee);
    const dateD = new Date(dateDepart);
    
    if (dateD <= dateA) {
        afficherErreur("La date de départ doit être après la date d'arrivée.");
        return;
    }

    // Calculer le nombre de nuits
    const nbNuits = Math.ceil((dateD - dateA) / (1000 * 60 * 60 * 24));

    // Validation du nombre de personnes
    const maxPersonnes = typeChalet === "4/5" ? 5 : 7;
    if (nbPersonnes > maxPersonnes) {
        afficherErreur(`Le chalet ${typeChalet} personnes ne peut accueillir que ${maxPersonnes} personnes maximum.`);
        return;
    }

    // Calculer le prix de base par nuit selon la saison
    let prixTotal = 0;
    let detailPrix = [];
    
    // Prix du chalet par nuit
    const saison = getSaison(dateA);
    const prixNuit = config.chalets[typeChalet][saison];
    prixTotal += prixNuit * nbNuits;
    
    detailPrix.push({
        label: `Chalet ${typeChalet} personnes (${getNomSaison(saison)})`,
        detail: `${prixNuit}€ × ${nbNuits} nuits`,
        prix: prixNuit * nbNuits
    });

    // Options
    if (optionMenage) {
        prixTotal += config.chalets.options.menage;
        detailPrix.push({
            label: 'Forfait ménage',
            detail: '',
            prix: config.chalets.options.menage
        });
    }

    if (nbDraps > 0) {
        const prixDraps = config.chalets.options.draps * nbDraps;
        prixTotal += prixDraps;
        detailPrix.push({
            label: 'Location draps',
            detail: `${config.chalets.options.draps}€ × ${nbDraps} lits`,
            prix: prixDraps
        });
    }

    if (nbChiens > 0) {
        const prixChiens = config.chalets.options.chien * nbChiens * nbNuits;
        prixTotal += prixChiens;
        detailPrix.push({
            label: 'Chien(s)',
            detail: `${config.chalets.options.chien}€ × ${nbChiens} chien(s) × ${nbNuits} nuits`,
            prix: prixChiens
        });
    }

    // Afficher le résultat
    afficherResultat(dateA, dateD, nbNuits, detailPrix, prixTotal);
}

function afficherResultat(dateArrivee, dateDepart, nbNuits, detailPrix, prixTotal) {
    const resultDiv = document.getElementById('result');
    const datesSejour = document.getElementById('datesSejour');
    const detailPrixDiv = document.getElementById('detailPrix');
    const prixTotalDiv = document.getElementById('prixTotal');
    
    // Cacher le message d'erreur s'il était affiché
    document.getElementById('errorMessage').classList.add('hidden');
    
    // Afficher les dates
    datesSejour.innerHTML = `
        <p><strong>Arrivée :</strong> ${formatDate(dateArrivee)}</p>
        <p><strong>Départ :</strong> ${formatDate(dateDepart)}</p>
        <p><strong>Durée du séjour :</strong> ${nbNuits} nuit${nbNuits > 1 ? 's' : ''}</p>
    `;

    // Afficher le détail des prix
    detailPrixDiv.innerHTML = detailPrix.map(item => `
        <div class="prix-detail">
            <span class="prix-label">${item.label}</span>
            ${item.detail ? `<span class="prix-calcul">${item.detail}</span>` : ''}
            <span class="prix-montant">${item.prix.toFixed(2)}€</span>
        </div>
    `).join('');

    // Afficher le prix total
    prixTotalDiv.innerHTML = `
        <div class="total">
            <span>Total</span>
            <span>${prixTotal.toFixed(2)}€</span>
        </div>
    `;

    // Afficher le résultat
    resultDiv.classList.remove('hidden');
}

function afficherErreur(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    document.getElementById('result').classList.add('hidden');
}
