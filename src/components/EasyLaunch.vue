<template>
  <div class="mea-easy-launch-container">
    <loading :active="activeOverlay" :is-full-page="false" loader="bars" class="mea-overlay-style"/>
    <template v-if="!activeOverlay && !cardData.panImage">
      <div class="mea-data mea-pan-result" v-if="encodedData.pan && cardData.showPan">
        <div class="mea-input-name">PAN:</div> {{encodedData.pan}}
        <CopyToClipboard :text="encodedData.pan" @copy=copyPan>
          <span class="mea-copy-text" :class="panCopied ? 'data-copied pan-copied' : '' ">
            {{ panCopied  ? "Copied!" : "Copy" }}
          </span>
        </CopyToClipboard>
      </div>
      <div class="mea-data mea-expiry-result" v-if="encodedData.expiry && cardData.showExpiry" >
        <div class="mea-input-name">Expiry:</div> {{formattedExpiry}}
        <CopyToClipboard :text="formattedExpiry" @copy=copyExpiry>
          <span class="mea-copy-text" :class="expiryCopied ? 'data-copied expiry-copied' : '' ">
            {{ expiryCopied  ? "Copied!" : "Copy" }}
          </span>
        </CopyToClipboard>
      </div>
      <div class="mea-data mea-cvv-result" v-if="encodedData.cvv && cardData.showCvv">
        <div class="mea-input-name">CVC:</div> {{encodedData.cvv}}
      </div>
      <div class="mea-data mea-emboss-result" v-if="encodedData.embossname && cardData.showEmbossName">
        <div class="mea-input-name">Name:</div> {{encodedData.embossname}}
        <CopyToClipboard :text="encodedData.embossname" @copy=copyEmboss>
          <span class="mea-copy-text" :class="embossCopied ? 'data-copied emboss-copied' : '' ">
            {{ embossCopied  ? "Copied!" : "Copy" }}
          </span>
        </CopyToClipboard>
      </div>
    </template>
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
      displayTimeout: 60000,
      formattedExpiry: '',
      activeOverlay: false,
      panCopied: false,
      expiryCopied: false,
      embossCopied: false
    }
  },
  props: {
    cardData: Object
  },
  methods: {
    initEncryptionKey () {
      this.$emit('infoLog', 'Getting data')
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
            this.initResultTimeout()
            this.$emit('infoLog', 'Getting data done')
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
      if (this.cardData.showExpiry) {
        this.formatExpiryDate()
      }
    },
    formatExpiryDate() {
      const t = new Date(this.encodedData.expiry);
      const month = ('0' + (t.getMonth() + 1)).slice(-2);
      const year = t.getFullYear().toString().substr(-2)
      this.formattedExpiry = `${month}/${year}`;
    },
    copyPan () {
      this.panCopied = true
      setTimeout(() => {
        this.panCopied = false
      }, 2000)
    },
    copyExpiry () {
      this.expiryCopied = true
      setTimeout(() => {
        this.expiryCopied = false
      }, 2000)
    },
    copyEmboss () {
      this.embossCopied = true
      setTimeout(() => {
        this.embossCopied = false
      }, 2000)
    },
    initResultTimeout () {
      setTimeout(() => {
        this.encodedData = ''
        this.$emit('infoLog', 'Data was cleared')
      }, this.displayTimeout)
    },
  },
  beforeMount () {
    this.publicKey = this.cardData.publicKey
    this.key = forge.random.getBytesSync(32)
    this.keyHex = forge.util.bytesToHex(this.key)
    delete this.cardData.publicKey
  },
  mounted () {
    this.initEncryptionKey()
  },
  components: {
    Loading,
    CopyToClipboard
  }
}
</script>
