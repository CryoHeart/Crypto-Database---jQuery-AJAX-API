let coinAPI = [];
let coinReport = new Set();
let moreInfoCache = new Map();
let modalToggles = new Array();
// TODO: Add this new set
let excludeList = new Set();


(function () {

    $("#currencyContainer").show();
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
        $(checkboxHtml).on("click", function () {
            addCardToReports($(this).prop("checked"), coin.coinSymbol)
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
        $(".coinCheckbox").prop("checked", false);
        coinReport.forEach((checkedCoin) => {
            $(`#${checkedCoin}`).prop("checked", true);
        })
    }

    $(`#searchButton`).on("click", function () {
        search($(`#searchBar`).val())
    });





    // MORE INFO
    $(document).on("click", ".collapsible", function moreInfoFunction() {

        let id = $(this).closest(".card").attr("id");
        console.log(id);
        let report = coinAPI.filter(p => p.coinSymbol == id);
        let idOfCoin = report[0].coinId

        // Comment: if the 'moreInfo' slide is visible - remove it
        let isMoreInfoVisible = $(`#${idOfCoin}_slide`).is(":visible");
        if (isMoreInfoVisible) {
            $(`#${idOfCoin}_slide`).remove()

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
            if (!$(`#${moreInfo.id}_slide`).length) {
                let coinInfoHtml = `<div class="moreInfoSlide" id="${moreInfo.id}_slide"><div class="moreInfoSlideData">
                USD ${moreInfo.usd} <br>
                EUR ${moreInfo.eur} <br>
                ILS ${moreInfo.ils} <br></div>
                <div class="moreInfoSlideLogo"><img src="${moreInfo.image}"></div>
                </div>`;

                setTimeout(() => { $(`#${moreInfo.id}_moreInfo`).append(coinInfoHtml); }, 350);
            }

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
                coinReport.add(coinSymbol);
            }
            else {
                coinReport.add(coinSymbol);
                displayModal();
            }
        }
        else {
            coinReport.delete(coinSymbol)
        }
        console.log(coinReport)
    }
    function displayModal() {
        let filteredCoinsForModal = [];
        $(".modalBody").empty();
        let modalHtml = $(`<div class="popUp"><div class="modalContainer">
        <div class="modalHeader">You may use no more than 5 coins for a live report.</br> Please remove at least one</div>
        <div class="modalBody"></div>
        <div class="modalFooter">
        <button class="btn btn-info" id="saveButton">Save Changes</button>
        <button class="btn btn-secondary" id="cancelButton">Cancel</button>
        </div>
        </div></div>`);

        $("body").append(modalHtml);

        coinReport.forEach((coin) => {
            search(coin, coinAPI);
            console.log('filteredCoinsForModal', filteredCoinsForModal);
        });

        filteredCoinsForModal.forEach((coin) => {
            createModalCards(coin);
        });
        $(".modalBody").children(".card").children(".coinCheckbox").prop("checked", true)
        // toggleCoinsForReports();
        function search(coin, coinAPI) {
            for (let index = 0; index < coinAPI.length; index++) {
                if (coinAPI[index].coinSymbol == coin) {
                    filteredCoinsForModal.push(coinAPI[index])
                }
            }
        }

        function createModalCards(coin) {
            //TODO: I removed the image here
            let modalCoinHtml = $(`<div class="cardOfModal" id="${coin.coinSymbol}">
            <img class="card-img-top" src="Media/cryptoCoins.jpg">
            <div class="cardTextContainer">
            <h4>${coin.coinName}</h4>
            <h5>${coin.coinSymbolUpperCase}</h5>
            </div>`);

            let toggleHtml = $(`<label class="switch"><span class="slider round"></span></label>`);

            $(modalCoinHtml).append(toggleHtml)

            let modalCheckboxHtml = $(`<input class="coinCheckbox" checked type="checkbox" id="${coin.coinSymbol}"/>`);
            $(modalCheckboxHtml).on("click", function () {
                //TODO: Call the new 'uncheckedCard' function
                uncheckedCard($(this).prop("checked"), coin.coinSymbol)
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

        //TODO: Add this function
        function uncheckedCard(property, coinSymbol) {
            if (property != true) {
                excludeList.add(coinSymbol);
            }
            else {
                excludeList.delete(coinSymbol)
            }
            console.log('excludeList', excludeList)
        }

        //TODO: Use excludeList set to remove the selected coins
        $("#saveButton").on("click", function () {
            if (excludeList.length == 0) {
                alert("You cannot have more than 5 coins in a report. /n Please remove at least one coin.");
                return;
            } else {
                excludeList.forEach((coin) => {
                    coinReport.delete(coin)
                    $(`#${coin}_checkbox`).prop("checked", false);
                });
                $(".popUp").remove();
            }
        })

        $("#cancelButton").on("click", function () {

            $(".popUp").remove();

            //remove the last added toggle
            // toggleState.pop();
            const lastValue = Array.from(coinReport).pop();
            coinReport.delete(lastValue)

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




// NAVIGATING FUNCTIONS


// About button:
$("#aboutButton").click(function () {
    $("#currencyContainer").hide();
    $("#liveReports").hide();
    $("#about").show();
});

// Live reports button:
function showLiveReports() {
    if (coinReport.size == 0) {
        alert("You must choose at least one coin in order to view live reports.");


        // location.reload();
    }
    else {


        $("#about").hide();
        $("#currencyContainer").hide();
        $("#liveReports").show();


        showContent($("#liveReports"));
        let selectedCoins = [...coinReport.values()].join(',');
        const liveReportsUrl = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + selectedCoins + "&tsyms=USD";
        console.log(liveReportsUrl);

        $(function getAPI() {


            $.get(liveReportsUrl)
                .then(function (coins) {
                    console.log(coins);
                })
                .catch(() => console.log("Failed"));
        });

        createLiveReportsChart(liveReportsUrl);

        chartUpdateInterval = setInterval(function () {
            UpdateLiveReportsChart(liveReportsUrl);
        }, 2000);
    }

    function showContent(liveReports) {
        var liveReports = document.getElementById("liveReports");
        if (liveReports.style.display === "none") {
            liveReports.style.display = "block";
        }
    }

    //   Home button:
    $("#homeButton").click(function () {
        $("#about").hide();
        $("#liveReports").hide();
        $("#currencyContainer").show();
    })
}




//Creating the live reports

function createLiveReportsChart(liveReportsUrl) {


    $("#liveReports").append(`<div id="liveChartsCanvas"></div>`);
    $("#h").css("display", "none");
    CanvasJS.addColorSet("Colors", ["#ff555e", "#ff8650", "#ffe981", "#83b2ff", "#9b6ef3"]);

    let chart = new CanvasJS.Chart("liveChartsCanvas", {
      animationEnabled: true,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zoomEnabled: true,
      colorSet: "Colors",
      theme: "dark2",
      title: {
        text: "Coins - live charts (2 sec refresh rate)",
        fontFamily: `Revamped`,
        fontColor: "#B0E6E6",
        fontSize: 40
      },
      axisX: {
        title: "Time",
        labelAngle: 0,
        labelTextAlign: "left",
        titleFontFamily: "Raleway",
        labelFontSize: 18,
        labelFontFamily: "Raleway"
      },
      axisY: {
        prefix: "$",
        title: "Value in USD",
        titleFontFamily: "Raleway",
        labelFontSize: 18,
        labelFontFamily: "Raleway"
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        verticalAlign: "top",
        fontSize: 22,
        fontColor: "dimGrey",
        itemclick: toggleDataSeries,
        fontFamily: "Raleway",
        fontColor: "#aaffaa"
      },
      data: []
    });


    function toggleDataSeries(e) {
      if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
      }
      else {
        e.dataSeries.visible = true;
      }
      chart.render();
    }
    $.get(liveReportsUrl, function (coinsData) {
      $("#liveChartsCanvas").css("display", "block");
      $("#liveChartsCanvas").css("height", "800px");
      $.each(coinsData, function (key, value) {
        value = JSON.stringify(value).replace("\"USD\":", "").replace("{", "").replace("}", "");
        let time = new Date().getTime();
        let newCoinData = {
          type: "spline",
          xValueType: "dateTime",
          yValueFormatString: "$####.00",
          xValueFormatString: "hh:mm:ss TT",
          showInLegend: true,
          lineThickness: 4,
          name: key,
          dataPoints: [{ x: time, y: parseInt(value) }]
        };
        chart.addTo("data", newCoinData);
      });
      chart.render();
      updateChart();
    })
      .catch(() => console.log("Failed (Live Charts 1)"));

    function updateChart() {
      let index = 0;
      $.get(liveReportsUrl, function (coinsData) {
        $.each(coinsData, function (key, value) {
          value = JSON.stringify(value).replace("\"USD\":", "").replace("{", "").replace("}", "");
          let time = new Date().getTime();
          let newData = { x: time, y: parseInt(value) };
          chart.data[index].dataPoints.push(newData);
          index++
        });
        chart.render();
        setTimeout(function () { updateChart() }, 2000);
      })
        .catch(() => console.log("Failed (Live Charts 2)"));
    };
  };

