/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1579624:1585723.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2014(scope) {
scope.questData = {
  quests: [{
    id: "quest-employee",
    description: "Falling off the corporate ladder",
    steps: [{
      id: "office-worker-2",
      ordered: !0,
      optional: !1,
      texts: ["Thank god you're here! I sent a letter to my boss earlier, but I need to get it back before he sees it...", "He lives at the red cliff house. Do you think he's read it yet?"],
      extraData: {
        uiTitle: "Next Up",
        uiIcon: "ui/quests/house.icon",
        uiText: "Find the red cliff house and get the letter back",
        uiColor: "#c25959"
      }
    }, {
      id: "boss",
      ordered: !0,
      optional: !1,
      texts: ["One of my employees wrote this? I can't believe it... this... is...", "...hilarious. Wow, he's really roasting me. Maybe he's manager material after all...", "Can you take this note back to him? He works in the main square."],
      extraData: {
        uiTitle: "Package Received",
        uiIcon: "ui/quests/officeworker.icon",
        uiText: "TAKE THE BOSS'S NOTE TO THE OFFICE WORKER IN THE MAIN SQUARE",
        uiColor: "#c25959",
        receiveModel: "deliveries/note.drc"
      }
    }, {
      id: "office-worker-2",
      ordered: !0,
      optional: !1,
      texts: ["I'm getting... promoted?", "Wow, who would have known that acting on my lowest instincts would help me advance in the corporate world."],
      extraData: {
        uiTitle: "Completed",
        uiIcon: "ui/quests/complete.icon",
        uiText: "CONGRATULATIONS! ANOTHER SUCCESSFUL DELIVERY COMPLETED",
        uiColor: "#c25959"
      }
    }]
  }, {
    id: "quest-caveman",
    description: "A man who's hiding from something",
    steps: [{
      id: "caveman",
      ordered: !0,
      optional: !1,
      texts: ["Hey there! Can you please take this postcard to my wife? She sells flowers in the main square.", "I'd give it to her myself but I... uh... have a bad knee at the moment..."],
      extraData: {
        uiTitle: "Package Received",
        uiIcon: "ui/quests/flowerlady.icon",
        uiText: "TAKE THE CAVE MAN'S POSTCARD TO THE WOMAN IN THE MAIN SQUARE",
        uiColor: "#f3c258",
        receiveModel: "deliveries/postcard.drc"
      }
    }, {
      id: "flower-lady",
      ordered: !0,
      optional: !1,
      texts: ["Oh, a postcard from my husband!", "He's on an overseas business trip at the moment, visiting all kinds of exotic places!", "Look, between you and me, I know he's living in a cave in the forest... I hope his midlife crisis passes soon...", "Would you mind bringing him these clean clothes? Don't say they're from me. Just tell him he won a prize."],
      extraData: {
        uiTitle: "Package Received",
        uiIcon: "ui/quests/cave.icon",
        uiText: "TAKE THE CLEAN CLOTHES TO THE MAN IN THE CAVE",
        uiColor: "#f3c258",
        receiveModel: "deliveries/clothes.drc"
      }
    }, {
      id: "caveman",
      ordered: !0,
      optional: !1,
      texts: ["Wow, another prize?", "Just in time, too. I'm down to my last pair of underwear."],
      extraData: {
        uiTitle: "Completed",
        uiIcon: "ui/quests/complete.icon",
        uiText: "CONGRATULATIONS! ANOTHER SUCCESSFUL DELIVERY COMPLETED",
        uiColor: "#f3c258"
      }
    }]
  }, {
    id: "quest-scientists",
    description: "Scientists and mixed-up deliveries",
    steps: [{
      id: "factory-worker-a",
      ordered: !0,
      optional: !1,
      texts: ["Hey, can you help me with something? We're short on staff lately and, well, some of our mail went to the wrong address by mistake...", "Go find Doctor Frieb and see if he's received any packages lately. He lives at the base of the mountain temple."],
      extraData: {
        uiTitle: "Next Up",
        uiIcon: "ui/quests/frieb.icon",
        uiText: "FIND DOCTOR FRIEB AT THE BASE OF THE MOUNTAIN TEMPLE",
        uiColor: "#66BDE6"
      }
    }, {
      id: "male-scientist",
      ordered: !0,
      optional: !1,
      texts: ['Hello! Yes, I opened some mail by mistake earlier. A "planet gravity data analysis", or something...', "They probably mixed me up with Doctor Frebi at Capital Corp...", "...wait, does that mean MY ORDER went to Dr Frebi? Oh no!!!", "I... uh... ordered the wrong thing anyway... Tell her I don't need it anymore..."],
      extraData: {
        uiTitle: "Package Received",
        uiIcon: "ui/quests/frebi.icon",
        uiText: "TAKE THE GRAVITY DATA ANALYSIS TO DOCTOR FREBI, AT CAPITAL CORP",
        uiColor: "#66BDE6",
        receiveModel: "deliveries/samplebox.drc"
      }
    }, {
      id: "female-scientist",
      ordered: !0,
      optional: !1,
      texts: ["Oh hey, you work for the delivery company? I've been meaning to talk to you guys...", "Do you know why I received 63 packets of instant noodles? Was that meant to go to the grocery store or something?", "You don't know anything about that? Oh well. Thanks for the package."],
      extraData: {
        uiTitle: "Completed",
        uiIcon: "ui/quests/complete.icon",
        uiText: "CONGRATULATIONS! ANOTHER SUCCESSFUL DELIVERY COMPLETED",
        uiColor: "#66BDE6"
      }
    }]
  }, {
    id: "quest-temple",
    description: "An offering to the mountain temple",
    steps: [{
      id: "oldwoman",
      ordered: !0,
      optional: !1,
      texts: ["Excuse me, could you please take this offering up to the mountain temple for me?", "I have trouble making it up the slope by myself these days."],
      extraData: {
        uiTitle: "Package Received",
        uiIcon: "ui/quests/temple.icon",
        uiText: "TAKE THE OLD WOMAN'S OFFERING TO THE MOUNTAIN TEMPLE",
        uiColor: "#8cc48c",
        receiveModel: "deliveries/offering.drc"
      }
    }, {
      id: "mountainman",
      ordered: !0,
      optional: !1,
      texts: ["Oh, pastries and sake?", "My favourite."],
      extraData: {
        uiTitle: "Completed",
        uiIcon: "ui/quests/complete.icon",
        uiText: "CONGRATULATIONS! ANOTHER SUCCESSFUL DELIVERY COMPLETED",
        uiColor: "#8cc48c"
      }
    }]
  }, {
    id: "quest-musician",
    description: "A note lost at sea",
    steps: [{
      id: "diver",
      ordered: !0,
      optional: !1,
      texts: ["Check this out! I was diving for oysters earlier and found these old lock boxes buried in the sand.", "One of them had a letter inside. It's a bit wet, but I can make out the name Dave at the top.", "Pretty crazy huh? I know a guy called Dave. Do you think it could be the same one?", "He's probably down at smelly falls, if you want to take it to him."],
      extraData: {
        uiTitle: "Package Received",
        uiIcon: "ui/quests/musician.icon",
        uiText: "TAKE THE MYSTERY LETTER TO DAVE AT SMELLY FALLS",
        uiColor: "#de794e",
        receiveModel: "deliveries/letterwet.drc"
      }
    }, {
      id: "musician",
      ordered: !0,
      optional: !1,
      texts: ["A letter for me? From under the sea? The one who wrote it... is me!", "Let's see what I wrote to myself all those years ago...", '"Dear Future Dave..."', '"Keep practicing every day..."', '"Get plenty of sunshine..."', '"Take care of your hair. Let it grow wild and free. Your hair is your soul and the most defining feature of your personality."', "Well...", "...two out of three ain't bad."],
      extraData: {
        uiTitle: "Completed",
        uiIcon: "ui/quests/complete.icon",
        uiText: "CONGRATULATIONS! ANOTHER SUCCESSFUL DELIVERY COMPLETED",
        uiColor: "#de794e"
      }
    }]
  }]
};
}
