let coinAPI = [];
let coinReport = new Set();
let moreInfoCache = new Map();
let modalToggles = new Array();

(function () {


    $(function getAPI() {
        $.get("https://api.coingecko.com/api/v3/coins")
            .then(function (coins) {
                coinInit(coins);
                updateUI();
                toggleCoinsForReports();
            })
            .catch(() => console.log("Failed"));
    });

    function coinInit(coins) {
        for (let i = 0; i < 50; i++) {
            let coinId = coins[i].id;
            let coinSymbol = coins[i].symbol;
            let coinSymbolUpperCase = coins[i].symbol.toUpperCase();
            let coinName = coins[i].name;
            let coin = {
                coinId,
                coinSymbol,
                coinSymbolUpperCase,
                coinName
            }
            coinAPI.push(coin);
        }
    }
    console.log(coinAPI);
    function updateUI() {

        for (let i = 0; i < coinAPI.length; i++) {
            addCard(coinAPI[i])
        }
    }

    // Creating the cards
    function addCard(coin) {
        let coinHtml = $(`<div class="card" id="${coin.coinSymbol}">
            <img class="card-img-top" src="Media/cryptoCoins.jpg">
            <div class="cardTextContainer">
            <h4>${coin.coinName}</h4>
            <h5>${coin.coinSymbolUpperCase}</h5>
            </div>`);
            
            let toggleHtml = $(`<label class="switch"><span class="slider round"></span></label>`);
            
            $(coinHtml).append(toggleHtml)
            let checkboxHtml = $(`<input class="coinCheckbox" type="checkbox" id="${coin.coinSymbol}_checkbox"/>`);
            $(checkboxHtml).on("click", function(){
                addCardToReports($(this).prop("checked"),coin.coinSymbol)
            });
            $(toggleHtml).prepend(checkboxHtml)

            let cardBottomHtml = $(`<button type="button" class="collapsible" id="${coin.coinId}_button">More info</button>
            <div class="progressBackground" id="${coin.coinId}_progressBackground">
            <div id="${coin.coinId}_progressBar" class="progressBar"></div></div>
            <div class="coinInfo" id="${coin.coinId}_moreInfo"></div>
            </div>`);

            $(coinHtml).append(cardBottomHtml);

        $("#currencyContainer").append(coinHtml);
    }

    function toggleCoinsForReports() {
        $(".coinCheckbox").prop("checked",false);
        coinReport.forEach((checkedCoin) => {
            $(`#${checkedCoin}`).prop("checked",true);
        })
    }
   
    $(`#searchButton`).on("click", function () {
        search($(`#searchBar`).val())
    });
    $(`#homeButton`).on("click", function () {
        location.reload();
    });

    // MORE INFO
    $(document).on("click", ".collapsible", function moreInfoFunction() {
        let id = $(this).closest(".card").attr("id");
        console.log(id);
        let report = coinAPI.filter(p => p.coinSymbol == id);
        let idOfCoin = report[0].coinId

        // Comment: if the 'moreInfo' slide is visible - remove it
        let isMoreInfoVisible = $(`#${idOfCoin}_slide`).is(":visible");
        if(isMoreInfoVisible) {
            $(`#${idOfCoin}_slide`).remove()
            // Comment: you can also use toggle but if you want to get the value from the local cache it requires a few changes
            // $(`#${idOfCoin}_moreInfo`).toggle(500);
        }

        // Comment: else if the coin ID doesn't exist in 'moreInfoCache' map, get the data
        else if (!moreInfoCache.has(idOfCoin)) {
            $.get(`https://api.coingecko.com/api/v3/coins/${idOfCoin}`)
                .then(function (coinInfo) {
                    moreInfo = saveCoinMoreInfo(coinInfo);
                     // Comment: I changed the key from 'coinInfo' to 'coinInfo.id', we don't want an object as a key ;)
                    saveToCache(coinInfo.id, moreInfo);
                    progressBar(`${idOfCoin}`);
                    showMoreInfo(moreInfo);
                })
                .catch((error) => console.log("Failed: ", error))
        }
        // Comment: else - add the 'moreInfo' slide
        else {
            moreInfo = moreInfoCache.get(idOfCoin)
            showMoreInfo(moreInfo);
            // Comment: same as line 96
            // $(`#${moreInfo.id}_moreInfo`).toggle(500);
        }

        // SHOW MORE INFO FUNCTION
        function showMoreInfo(moreInfo) {
            if(!$(`#${moreInfo.id}_slide`).length) {
                let coinInfoHtml = `<div class="moreInfoSlide" id="${moreInfo.id}_slide"><div class="moreInfoSlideData">
                USD ${moreInfo.usd} <br>
                EUR ${moreInfo.eur} <br>
                ILS ${moreInfo.ils} <br></div>
                <div class="moreInfoSlideLogo"><img src="${moreInfo.image}"></div>
                </div>`;

                setTimeout(() => { $(`#${moreInfo.id}_moreInfo`).append(coinInfoHtml); }, 300);

            }
            // Commenet: Remove these lines
            // else {
            //     $(`#${moreInfo.id}_moreInfo`).toggle(500);
            // }
        }

        // SAVING MORE INFO FUNCTION
        function saveCoinMoreInfo(coinInfo) {

            let usd = coinInfo.market_data.current_price.usd + " $";
            let eur = coinInfo.market_data.current_price.eur + " €";
            let ils = coinInfo.market_data.current_price.ils + " ₪";
            let image = coinInfo.image.small;
            let id = coinInfo.id;

            let moreInfo = { usd, eur, ils, image, id };

            return moreInfo;
        }
    })
    
    // SEARCH BAR FUNCTION
    function search(searchInput) {
        if (searchInput != "") {
            searchInput = searchInput.toLowerCase();
            let foundCoin = coinAPI.find(
                (coin) => coin.coinSymbol === searchInput);
            if (foundCoin) {
                $(`#currencyContainer`).empty();
                addCard(foundCoin);
            }
        }
    }

    function progressBar(coinId) {
        let width = 1;
        let startProgress = setInterval(progress, 5);
        function progress() {
            if (width > 249) {
                $(`#${coinId}_progressBackground`).remove();
                clearInterval(startProgress);
                return true;
            }
            else {
                width += 10;
                $(`#${coinId}_progressBar`).width(width);
            }
        }
    }

    function addCardToReports(property, coinSymbol) {
        if (property == true) {
            if (coinReport.size < 5) {
                coinReport.add(coinSymbol)
            }
            else {
                $(property = false);
                coinReport.add(coinSymbol)
                displayModal();
            }
        }
        else {
            coinReport.delete(coinSymbol)
        }
    }

    function displayModal() {
        let filteredCoinsForModal = [];
        $(".modalBody").empty();
        let modalHtml =  $(`<div class="popUp"><div class="modalContainer">
        <div class="modalHeader">You may use no more than 5 coins for a live report.</br> Please remove at least one</div>
        <div class="modalBody"></div>
        <div class="modalFooter">
        <button class="btn btn-info" id="saveButton">Save Changes</button>
        <button class="btn btn-secondary" id="cancelButton">Cancel</button>
        </div>
        </div></div>`);
    
        $("body").append(modalHtml);
    
        coinReport.forEach((coin) => {
             search(coin,coinAPI);
        });
    
        filteredCoinsForModal.forEach((coin) => {
            createModalCards(coin);
        });
        $(".modalBody").children(".card").children(".coinCheckbox").prop("checked",true)
        //toggleCoinsForReports();
        function search(coin,coinAPI) {
            for(let index = 0;index < coinAPI.length; index++) {
                if (coinAPI[index].coinSymbol == coin) {
                    filteredCoinsForModal.push(coinAPI[index])
                }
            }
        }

        function createModalCards(coin) {
            let modalCoinHtml = $(`<div class="card" id="${coin.coinSymbol}_modal">
            <img class="card-img-top" src="Media/cryptoCoins.jpg">
            <div class="cardTextContainer">
            <h4>${coin.coinName}</h4>
            <h5>${coin.coinSymbolUpperCase}</h5>
            </div>`);
            
            let toggleHtml = $(`<label class="switch"><span class="slider round" id=${coin.coinSymbol}_checkbox></span></label>`);
            
            $(modalCoinHtml).append(toggleHtml)

            let modalCheckboxHtml = $(`<input class="coinCheckbox" checked type="checkbox" id="${coin.coinSymbol}_modalCheckbox"/>`);
            $(modalCheckboxHtml).on("click", function(){
                // addCardToReports($(this).prop("checked"),coin.coinSymbol)
            });
            $(toggleHtml).prepend(modalCheckboxHtml)

            // let cardBottomHtml = $(`<button type="button" class="collapsible" id="${coin.coinId}_button">More info</button>
            // <div class="progressBackground" id="${coin.coinId}_progressBackground">
            // <div id="${coin.coinId}_progressBar" class="progressBar"></div></div>
            // <div class="coinInfo" id="${coin.coinId}_moreInfo"></div>
            // </div>`);

            // $(modalCoinHtml).append(cardBottomHtml);        
            $(".modalBody").append(modalCoinHtml);
        }

        $("#saveButton").on("click",function(){

            if (modalToggles.length == 5) {
                modalToggles = [];
                alert("You cannot have more than 5 coins in a report. /n Please remove at least one coin.");
                return;
            }
        })
        
        $("#cancelButton").on("click", function(){

            $(".popUp").remove();
        
            //remove the last added toggle
            const lastValue = Array.from(coinReport).pop();
            coinReport.delete(lastValue);

            $(`#${lastValue}_checkbox`).prop("checked", false);

        
        })
    }
})();

// Add/remove coins from report***



function saveToCache(coinId, moreInfo) {

    moreInfoCache.set(coinId, moreInfo);
    setTimeout(function () {
        moreInfoCache.delete(coinId)
    }, 120000);
}


// MODAL PLANNING



    // ACTUAL MODAL PROGRAMMING
function createModalOverlay() {

    let modalBackground = createDarkBackground();

    let modalContainer = createModalBox(modalBackground);

    createModalHeader(modalContainer);

    createModalBody(modalContainer);
    for (index = 0; index < coinReport.length; index++) {
        createModalCards(coinReport[index]);
    }

    let modalFooter = createModalFooter(modalContainer);

    createSaveButton(modalFooter);

    createCancelButton(modalFooter);

}

// LIVE REPORTS

function showLiveReports() {
    if (coinReport.size == 0) {
        alert("You must choose at least one coin in order to view live reports.");


        location.reload();
    } else {
        
        $("#currencyContainer").empty();

        showContent($("#liveReportsPage"));

        const liveReportsUrl = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + toggleState + "&tsyms=USD";

        createLiveReportsChart(liveReportsUrl);

        chartUpdateInterval = setInterval(function () {
            UpdateLiveReportsChart(liveReportsUrl);
        }, 2000);
    }
}