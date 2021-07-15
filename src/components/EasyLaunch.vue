<template>
  <div class="mea-easy-launch-container">
    <loading :active="activeOverlay" :is-full-page="false" loader="bars" class="mea-overlay-style"/>
    <CopyToClipboard v-if="encodedData.pan && !activeOverlay && !cardData.panImage" :text="encodedData.pan" @copy=copyPan>
      <div class="mea-pan-result">{{encodedData.pan}} <span class="mea-copy-text" :class="panCopied ? 'pan-copied' : '' ">{{ copyText }}</span></div>
    </CopyToClipboard>
  </div>
</template>

<script>
import forge from 'node-forge'
import easyLaunchService from '@/services/easyLaunchService'
import CryptoJS from 'crypto-js'
import CopyToClipboard from 'vue-copy-to-clipboard'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'

export default {
  data () {
    return {
      key: '',
      keyHex: '',
      publicKey: '',
      encodedData: '',
      copyText: '',
      panTimeout: 300000,
      activeOverlay: false,
      panCopied: false
    }
  },
  props: {
    cardData: Object
  },
  methods: {
    initEncryptionKey () {
      this.activeOverlay = true
      let publicKey = '-----BEGIN PUBLIC KEY-----' + CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(this.publicKey)) + '-----END PUBLIC KEY-----'
      let publicKeyDecoded = forge.pki.publicKeyFromPem(publicKey)
      this.cardData.encryptedKey = forge.util.bytesToHex(publicKeyDecoded.encrypt(this.key, 'RSA-OAEP', {
        md: forge.md.sha512.create(),
        mgf1: {
          md: forge.md.sha512.create()
        }
      }))
      if (!this.cardData.panImage) {
        easyLaunchService.getPan(this.cardData)
          .then(response => {
            this.decryptData(response)
            if (this.panTimeout !== 0) { // do not init timer to hide PAN data
              this.initResultTimeout()
            }
          })
          .catch(error => {
            console.log(error)
          })
          .finally(() => {
            this.activeOverlay = false
          })
      } else {
        easyLaunchService.getCardImage(this.cardData)
          .then(response => {
            console.log(response)
          })
          .catch(error => {
            console.log(error)
          })
          .finally(() => {
            this.activeOverlay = false
          })
      }

    },
    decryptData (data) {
      let key = CryptoJS.enc.Hex.parse(this.keyHex)
      let encIv  = CryptoJS.enc.Hex.parse(data.iv)
      let cryptText = CryptoJS.enc.Hex.parse(data.encryptedData)
      let cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: cryptText
      })
      this.encodedData = JSON.parse(CryptoJS.AES.decrypt(cipherParams, key, { iv: encIv}).toString(CryptoJS.enc.Utf8))
    },
    copyPan () {
      this.copyText = 'Copied !'
      this.panCopied = true
      setTimeout(() => {
        this.initCopyText()
      }, 2000)
    },
    initCopyText () {
      this.copyText = 'Copy'
      this.panCopied = false
    },
    initResultTimeout () {
      setTimeout(() => {
        this.encodedData = ''
      }, this.panTimeout)
    },
    initPanTimeout () { // by default we are setting timeout to 5min
      let timeout = parseInt(this.cardData.panTimeout)
      this.panTimeout = isNaN(timeout) ? this.panTimeout : timeout * 1000
    }
  },
  beforeMount () {
    this.publicKey = this.cardData.publicKey
    this.key = forge.random.getBytesSync(32)
    this.keyHex = forge.util.bytesToHex(this.key)
    delete this.cardData.publicKey
  },
  mounted () {
    this.initEncryptionKey()
    this.initCopyText()
    this.initPanTimeout()
  },
  components: {
    Loading,
    CopyToClipboard
  }
}
</script>
