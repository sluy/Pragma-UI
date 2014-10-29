/**
 * Pragma.Libs.Button
 * Plugin para los estadps de los botones.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-button : define el plugin.
 * data-button-options="[opciones]"     :   Opciones de configuración via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * Button.loading(text)    : Muestra el mensaje de "cargando" en el botón y adicionalmente bloquea el mismo.
 * Button.toggle()         : Si el botón está activo [active] dejará de estarlo, de lo contrario, lo activará. 
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.button.before_init : Lanzado al inicializar el plugin.
 * pragma.button.after_init   : Lanzado al terminar la configuración inicial del plugin.
 * pragma.button.change       : Lanzado al cambiar el estado del botón. Adicionalmente provee la propiedad de evento
 *                           : event.state, con el status al que cambió el botón (loading,reset,active,normal)
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 */
$(function( Pragma, $, undefined ) {
  "use strict";

  Pragma.Libs.Button = function(element,options){
    var self = this;
    self.options = options;
    self.$el = element;
    self.html = self.$el.html();

    /**
     * Muestra el mensaje de "cargando" en el botón y adicionalmente bloquea el mismo.
     * @param  {[type]} text Texto a mostrar en el botón. 
     *                       Si no es especificado tomará el valor de Button.options.loading_text.
     */
    self.loading = function(text){
      if(!text)
        text = self.options.loading_text;
      self.$el.addClass("disabled").html(text);
      self.$el.trigger({
        type: "pragma.button.change",
        state : "loading"
      });
    }
    /**
     * Devuelve el botón a su estado original.
     */
    self.reset = function(){
      self.$el.removeClass("disabled active").html(self.html);
      self.$el.trigger({
        type: "pragma.button.change",
        state : "reset"
      });
    }

    /**
     * Si el checkbox está marcado, lo desmarcará, de lo contrario, lo marcará.
     */
    function toggle_checkbox()
    {
      if(self.$el.find(" > input[type=checkbox]").length > 0)
      {
        var $checkbox = self.$el.find(" > input[type=checkbox]");
        if(self.$el.hasClass("active"))
        {
          $checkbox.prop("checked",true);
        }
        else
        {
          $checkbox.prop("checked",false);
        }
      }
    }
    /**
     * Si el radio está desmarcado lo marcará, y desmarcará todos los demás asociados.
     */
    function toggle_radio()
    {
      if(self.$el.find(" > input[type=radio]").length > 0)
      {
        var $radio = self.$el.find(" > input[type=radio]");

        if(self.$el.hasClass("active"))
        {
          if($radio.attr("name") !== undefined)
          {
            $("body").find(" input[type=radio][name='"+$radio.attr("name")+"']").each(function(){
              if($(this).parent().is("label") && $(this).parent().hasClass("button") && $(this) != $radio)
              {
                $(this).parent().removeClass("active");
              }
            });
          }
          $radio.prop("checked",true);
          self.$el.addClass("active");
        }
        else
        {
          $radio.prop("checked",false);
        }
      }
    }
    /**
     * Si el botón está activo [active] dejará de estarlo, de lo contrario, lo activará.
     * Adicionalmente, si el botón tiene un checkbox o radio definido, lo marcará/desmarcará dependiendo
     * del estado activo del botón padre.
     */
    self.toggle = function()
    {
      if(self.$el.hasClass("disabled"))
        return;
      if(!self.options.toggle)
      {
        self.options.toggle = true;
        configure_toggle();
      }
      if(self.$el.hasClass("active"))
      {
        self.$el.removeClass("active").blur();
        self.$el.trigger({
          type: "pragma.button.change",
          state : "normal"
        });

      }
      else
      {
        self.$el.addClass("active");
        self.$el.trigger({
          type: "pragma.button.change",
          state : "active"
        });
      }
      toggle_checkbox();
      toggle_radio();
    }


    /**
     * Configura el cambio de estado del botón.
     */
    function configure_toggle()
    {
      if(self.options.toggle)
      {
        if(self.$el.find(" > input[type=checkbox]").length > 0)
        {
          var $checkbox = self.$el.find(" > input[type=checkbox]");
          
          if($checkbox.is(":checked"))
          {
            self.$el.addClass("active");
          }
        }
        if(self.$el.find(" > input[type=radio]").length > 0)
        {
          var $radio = self.$el.find(" > input[type=radio]");
          if($radio.is(":checked"))
          {
            if($radio.attr("name")!== undefined)
            {
              $("body").find(" > [name='"+$radio.attr("name")+"']").each(function(){
                $(this).prop("checked",false);

                if($(this).parent().is("label") && $(this).parent().hasClass("button"))
                {
                  $(this).parent().removeClass("active");
                }
              });
            }
            self.$el.addClass("active");
            $radio.prop("checked",true);
          }
        }
        self.$el.on("click.pragma.button",function(e){
          e.preventDefault();
          self.toggle();
        });
      }
    }

    //Inicializará el cambio de estado entre activo/normal si la opción está activada.
    if(self.options.toggle)
    {
      configure_toggle();
    }
  }
  //Versión del plugin
  Pragma.Libs.Button.Ver = "1.0.0";
  /**Opciones del plugin**/
  Pragma.Libs.Button.Defaults = {
    toggle : false,//Determina si el estado del botón deberá cambiar entre activo/normal
    loading_text : "Cargando..." //Mensaje por defecto para el estado "loading"
  }

  //Inicializa el plugin definido en html al cargar la página.
  $(function() {
    $("[data-pragma-button-toggle]").each(function(e){
      $(this).pragma("button",{toggle:true});
    });
  });

}( window.Pragma = window.Pragma || {}, jQuery ));