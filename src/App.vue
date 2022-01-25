<template>
  <div id="app" class="mea-easy-launch-app">
    <EasyLaunch v-if="missingFields.length === 0 && initCardData" :cardData="getCardData"/>
  </div>
</template>

<script>
import EasyLaunch from './components/EasyLaunch.vue'
import store from '@/store/store'

export default {
  props: {
    cardId: {
      type: String
    },
    secret: {
      type: String
    },
    publicKey: {
      type: String
    },
    publicKeyFingerprint: {
      type: String
    },
    requestUrl: {
      type: String
    },
    apiKeyId: {
      type: String
    },
    apiKey: {
      type: String
    },
    panImage: {
      type: Boolean,
      default: false
    },
    showPan: {
      type: Boolean,
      default: true
    },
    showCvv: {
      type: Boolean,
      default: false
    },
    showEmbossName: {
      type: Boolean,
      default: false
    },
    showExpiry: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      missingFields: [],
      requiredFields: ['cardId', 'secret', 'publicKey', 'publicKeyFingerprint', 'requestUrl', 'apiKeyId', 'apiKey'],
      initCardData: false
    }
  },
  methods: {
    checkValidParams () {
      this.requiredFields.forEach(element => {
        let value = this.$props[element]
        if (value === undefined || value.length < 1 ) {
          this.missingFields.push(element)
        }
        else {
          if (element === 'apiKeyId') {
            store.commit('setApiKeyId', value)
          } else if (element === 'apiKey') {
            store.commit('setApiKey', value)
          }
        }
      })
      if (this.missingFields.length === 0) {
        this.initCardData = true
      } else {
        store.commit('initError', 'Missing required parameters: ' + this.missingFields)
      }
    }
  },
  computed: {
    getCardData () {
      let dataObject = Object()
      for (let [key, value] of Object.entries(this.$props)) {
        dataObject[key] = value
      }
      return dataObject
    }
  },
  beforeMount () {
    store.subscribe(mutation => {
      if (mutation.type === 'initError') {
        this.$emit('errorLog', mutation.payload)
      }
    })
  },
  mounted () {
    setTimeout(() => {
      this.checkValidParams()
    }, 100)
  },
  components: {
    EasyLaunch
  }
}
</script>

<style>
  .mea-easy-launch-app {
    padding: 5px;
    border: 1px dashed black;
    min-height: 30px;
    height: 100%;
    width: 100%;
    position: relative;
    background-color: #D3D3D3;
  }
  .mea-easy-launch-container {
    display: inline-block;
  }
  .mea-data {
    padding: 3px 0;
  }
  .mea-input-name {
    width: 55px;
    text-align: right;
    margin-right: 10px;
    display: inline-block;
  }
  .mea-easy-launch-app .mea-copy-text {
    cursor: pointer;
    color: #FF8C00;
    font-style: italic;
  }
  .mea-copy-text {
    padding-left: 5px;
  }
  .mea-easy-launch-app .mea-overlay-style .vld-icon  {
    width: 6%;
    height: auto;
  }
  .mea-easy-launch-appn .mea-overlay-style svg {
    fill: dodgerblue;
    width: 100%;
    height: 100%;
  }
</style>
