<template>
  <v-app
    :style="
      'background-color: ' +
      $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light'].bg
    "
  >
    <v-overlay :value="$store.state.site.loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-dialog
      v-if="$store.state.user.bcUser"
      v-model="$store.state.user.bcUser.guidedWizard"
      max-width="600px"
    >
      <v-card color="card" class="text-center justify-center">
        <div v-if="guidedWizard.step === 1">
          <v-card-title class="text-center justify-center">
            <span class="headline">Welcome to BetterCompass.</span>
          </v-card-title>
          <v-container>
            <p>
              BetterCompass is an enhanced version of Compass that resolves the
              long standing problems of Compass.
            </p>
            <p>
              Some major improvements that can be seen throughout BetterCompass
              are:
            </p>
            <ul style="list-style-type: none">
              <li>Themes & Customization</li>
              <li>Quick Route Switching</li>
              <li>Significantly Faster</li>
              <li>Consistent and modern UI</li>
              <li>Exclusive Features</li>
              <li>Mobile compatibility & Responsiveness</li>
              <li>Enhanced calendar</li>
            </ul>

            <v-btn
              color="red"
              class="mt-5 mr-3"
              @click="completeGuidedWizard()"
              :loading="loadingGuidedWizard"
            >
              <v-icon left>mdi-arrow-left</v-icon>
              Skip
            </v-btn>

            <v-btn color="primary" class="mt-5" @click="guidedWizard.step = 2">
              Continue
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-container>
        </div>
        <div v-if="guidedWizard.step === 2">
          <v-card-title class="text-center justify-center">
            <span class="headline">BetterCompass, your way.</span>
          </v-card-title>
          <v-card-subtitle class="text-center justify-center">
            <span class="subtitle-1">Let's choose a theme.</span>
          </v-card-subtitle>
          <v-container class="text-center justify-center">
            <v-flex>
              <v-layout column align-center>
                <v-switch
                  inset
                  v-model="$store.state.user.bcUser.theme"
                  @change="saveSettings"
                  true-value="dark"
                  false-value="light"
                  label="Dark Mode"
                  color="primary"
                  class="mt-5"
                ></v-switch>
              </v-layout>
            </v-flex>
            <v-card-text>
              <v-card
                class="my-2"
                @click="setTheme(theme)"
                elevation="7"
                v-for="(theme, index) in computeThemes"
                :key="index"
              >
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-bold">
                      {{ theme.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ theme.public ? "Public" : "Private" }}, created by
                      {{ theme.user.sussiId }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-avatar
                      color="success"
                      size="30"
                      v-if="name === theme.id"
                    >
                      <v-icon>mdi-check</v-icon>
                    </v-avatar>
                  </v-list-item-action>
                </v-list-item>
              </v-card>
            </v-card-text>
            <v-btn
              color="primary"
              class="mt-5 mr-3"
              @click="guidedWizard.step = 1"
            >
              <v-icon left>mdi-arrow-left</v-icon>
              Previous
            </v-btn>
            <v-btn color="primary" class="mt-5" @click="guidedWizard.step = 3">
              Continue
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-container>
        </div>
        <div v-if="guidedWizard.step === 3">
          <v-card-title class="text-center justify-center">
            <span class="headline">Other Preferences</span>
          </v-card-title>
          <v-card-subtitle class="text-center justify-center">
            <span class="subtitle-1"
              >If you wish, you may modify some additional settings.</span
            >
          </v-card-subtitle>
          <v-container class="text-center justify-center">
            <v-flex>
              <v-layout column align-center>
                <v-switch
                  @change="saveSettings"
                  v-model="$store.state.user.bcUser.learningTaskNotification"
                  inset
                  label="Show overdue learning task warning"
                  color="warning"
                ></v-switch>
                <v-switch
                  @change="saveSettings"
                  v-model="$store.state.user.bcUser.weather"
                  inset
                  label="Show weather widget"
                ></v-switch>
                <v-switch
                  @change="saveSettings"
                  v-model="$store.state.user.bcUser.minimizeHeaderEvents"
                  inset
                  label="Minimize header events"
                ></v-switch>
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <div v-on="on" v-bind="attrs">
                      <v-switch
                        @change="saveSettings"
                        v-model="$store.state.user.bcUser.calendarAutoJump"
                        inset
                        label="Calendar Auto Jump"
                      ></v-switch>
                    </div>
                  </template>
                  <span>
                    This will skip to Monday on Saturday and Sunday.
                  </span>
                </v-tooltip>
              </v-layout>
            </v-flex>
            <v-btn
              color="primary"
              class="mt-5 mr-3"
              @click="guidedWizard.step = 2"
            >
              <v-icon left>mdi-arrow-left</v-icon>
              Previous
            </v-btn>
            <v-btn
              color="primary"
              class="mt-5"
              @click="completeGuidedWizard()"
              :loading="loadingGuidedWizard"
            >
              Finish
            </v-btn>
          </v-container>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="$store.state.modals.search" max-width="600px">
      <v-card color="card">
        <v-toolbar color="toolbar">
          <v-toolbar-title> BetterCompass QuickSwitcher </v-toolbar-title>
        </v-toolbar>
        <v-container>
          <v-autocomplete
            auto-select-first
            v-model="search"
            :items="$store.state.quickSwitchCache"
            item-text="subjectLongName"
            label="Search"
            outlined
            autofocus
            return-object
            :search-input.sync="searchInput"
          >
          </v-autocomplete>
        </v-container>
      </v-card>
    </v-dialog>
    <Header></Header>
    <v-main>
      <v-container
        v-if="$store.state.site.latestVersion > $store.state.versioning.version"
      >
        <v-alert class="mx-4" type="info" text>
          BetterCompass just got better. Please CTRL+R / ⌘+R to update. (You are
          on version {{ $store.state.versioning.version }}, and the latest
          version is {{ $store.state.site.latestVersion }})
        </v-alert>
      </v-container>
      <v-container
        v-if="$store.state.site.notification && $store.state.user.bcUser"
      >
        <v-alert text class="mx-4" type="info">
          {{ $store.state.site.notification }}
        </v-alert>
      </v-container>
      <v-container v-if="!$store.state.online">
        <v-alert text class="mx-4" type="warning">
          You are currently offline. BetterCompass functionality is limited.
        </v-alert>
      </v-container>
      <v-container
        v-if="baseRole() !== 'Student' && baseRole() !== 'Not Authenticated'"
      >
        <v-alert class="mx-4 rounded-xl" dismissible type="info">
          {{ baseRole() }} accounts are not officially supported by
          BetterCompass yet.
        </v-alert>
      </v-container>
      <router-view
        :style="
          'background-color: ' +
          $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light'].bg
        "
      />
    </v-main>
  </v-app>
</template>
<style></style>
<script>
import Header from "./components/Header.vue"
import AjaxErrorHandler from "@/lib/errorHandler"
import Vue from "vue"
import Vuetify from "@/plugins/vuetify"
export default {
  name: "App",
  components: {
    Header
  },
  data: () => ({
    loading: false,
    defineAccent: false,
    accent: "#0179f3",
    loadingGuidedWizard: false,
    guidedWizard: {
      step: 1
    },
    connectionLoading: false,
    update: false,
    search: "",
    results: [],
    searchInput: null,
    themes: []
  }),
  computed: {
    computeThemes() {
      let array = []
      if (this.$vuetify.theme.dark) {
        array = this.themes.filter(
          (theme) => theme.primaryType === "dark" || theme.primaryType === "all"
        )
        return array
      } else {
        array = this.themes.filter(
          (theme) =>
            theme.primaryType === "light" || theme.primaryType === "all"
        )
        return array
      }
    }
  },
  methods: {
    baseRole() {
      if (this.$store.state.user?.baseRole) {
        return (
          this.$store.state.user.baseRole
            .toLowerCase()
            .charAt(0)
            .toUpperCase() +
          this.$store.state.user.baseRole.toLowerCase().slice(1)
        )
      } else {
        return "Not Authenticated"
      }
    },
    saveSettings() {
      this.loading = true
      this.$vuetify.theme.dark = this.$store.state.user.bcUser?.theme === "dark"
      this.$store
        .dispatch("saveOnlineSettings")
        .then(() => {
          this.loading = false
        })
        .catch((e) => {
          this.loading = false
          AjaxErrorHandler(this.$store)(e)
        })
    },
    completeGuidedWizard() {
      this.loadingGuidedWizard = true
      this.$store.dispatch("saveOnlineSettings", {
        guidedWizard: false
      })
      this.$store.dispatch("getUserInfo").then(() => {
        this.loadingGuidedWizard = false
      })
    },
    getThemes() {
      this.axios.get("/api/v1/themes").then((res) => {
        this.themes = res.data.map((theme) => {
          return {
            id: theme.id,
            name: theme.name,
            primaryType: theme.theme.primaryType,
            dark: theme.theme.dark,
            light: theme.theme.light,
            public: theme.public,
            user: theme.user,
            userId: theme.userId
          }
        })
      })
    },
    setTheme(theme) {
      const name = theme.id
      const dark = theme.dark
      const light = theme.light
      this.$vuetify.theme.themes.dark = dark
      this.$vuetify.theme.themes.light = light
      this.$vuetify.theme.themes.name = name
      this.$vuetify.theme.themes.primaryType = theme.primaryType
      if (this.accent && this.defineAccent) {
        this.$vuetify.theme.themes.light.primary = this.accent
        this.$vuetify.theme.themes.dark.primary = this.accent
        this.$store.state.user.bcUser.accentColor = this.accent
      } else {
        this.$store.state.user.bcUser.accentColor = null
      }
      this.name = name
      this.axios
        .put("/api/v1/user/settings/theme", {
          id: name,
          accent: this.defineAccent ? this.accent : null
        })
        .catch((e) => {
          AjaxErrorHandler(this.$store)(e)
        })
    },
    retryConnection() {
      this.connectionLoading = true
      this.$store.dispatch("getState").finally(() => {
        this.connectionLoading = false
      })
    },
    validate(value, defaultValue) {
      if (value === undefined || value === null) {
        return defaultValue
      } else {
        return value
      }
    }
  },
  mounted() {
    window.addEventListener("offline", () => {
      this.$store.commit("setOnline", false)
      this.$store.dispatch("getState")
    })
    window.addEventListener("online", () => {
      this.$store.commit("setOnline", true)
      this.$store.dispatch("getState")
      this.$store.dispatch("getUserInfo")
    })
    Vue.axios.defaults.headers.common["CompassAPIKey"] =
      localStorage.getItem("apiKey")
    document.title = this.$route.name
      ? this.$route.name + " - BetterCompass"
      : "BetterCompass"
    this.$store.commit("setLoading", true)
    this.$vuetify.theme.dark =
      this.$store.state.user.bcUser?.theme === "dark" || true
    this.$store.commit("setSchool", {
      name: localStorage.getItem("schoolName"),
      id: localStorage.getItem("schoolId"),
      fqdn: localStorage.getItem("schoolFqdn"),
      instance: localStorage.getItem("schoolInstance")
    })
    this.axios.defaults.headers.common["compassInstance"] =
      localStorage.getItem("schoolInstance")
    this.axios.defaults.headers.common["compassSchoolId"] =
      localStorage.getItem("schoolId")
    if (JSON.parse(localStorage.getItem("userCache"))?.bcUser?.id) {
      const user = JSON.parse(localStorage.getItem("userCache"))
      const name = user.bcUser.themeObject.id
      const dark = user.bcUser.themeObject.theme.dark
      const light = user.bcUser.themeObject.theme.light
      if (user.bcUser.accentColor) {
        user.bcUser.themeObject.theme.dark.primary = user.bcUser.accentColor
        user.bcUser.themeObject.theme.light.primary = user.bcUser.accentColor
      }
      Vuetify.framework.theme.themes.dark = dark
      Vuetify.framework.theme.themes.light = light
      Vuetify.framework.theme.themes.name = name
      Vuetify.framework.theme.themes.primaryType =
        user.bcUser.themeObject.theme.primaryType
      this.$store.commit(
        "setUser",
        JSON.parse(localStorage.getItem("userCache"))
      )
    }
    if (localStorage.getItem("calendarCache")?.length) {
      this.$store.commit(
        "setCalendar",
        JSON.parse(localStorage.getItem("calendarCache")).map((event) => {
          return {
            ...event,
            start: new Date(event.start),
            end: new Date(event.finish)
          }
        })
      )
    }
    this.getThemes()
    this.$store.dispatch("getState")
    this.$store
      .dispatch("getUserInfo")
      .then(() => {
        // eslint-disable-next-line no-undef
        if (JSON.parse(process.env.VUE_APP_MATOMO_ENABLED)) {
          // eslint-disable-next-line no-undef
          _paq.push(["setUserId", this.$store.state.user.bcUser.id])
          // eslint-disable-next-line no-undef
          _paq.push(["trackPageView"])
        }
        this.$store.dispatch("updateQuickSwitch")
      })
      .catch((e) => {
        console.log(e)
        this.$router.push("/login")
      })
  },
  watch: {
    "$store.state.user.bcUser.theme": {
      handler() {
        this.$vuetify.theme.dark =
          this.$store.state.user.bcUser.theme === "dark"
      },
      deep: true
    },
    $route(to) {
      document.title = to.name + " - BetterCompass"
    },
    search() {
      if (this.search) {
        if (this.search.id) {
          this.$router.push("/activity/activity/" + this.search.id)
          this.$store.commit("setSearch", false)
          this.search = null
          this.$nextTick(() => {
            this.searchInput = null
          })
        } else if (this.search.customType === 1) {
          this.$router.push(this.search.route)
          this.$store.commit("setSearch", false)
          this.search = null
          this.$nextTick(() => {
            this.searchInput = null
          })
        }
      }
    }
  }
}
</script>
