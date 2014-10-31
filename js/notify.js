/**
 * Pragma.Libs.Notify
 * Plugin para las notificaciones.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-notify : define el plugin.
 * data-notify-options="[opciones]"     :   Opciones de configuración via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * Notify.open()     : Abre la notificación modal.
 * Notify.close()    : Cierra la notificación.
 * Notify.toggle()   : Si la notificación está abierta, la cerrará, de lo contrario, la abrirá.
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.notify.before_init : Lanzado al inicializar el plugin.
 * pragma.notify.after_init  : Lanzado al terminar la configuración inicial del plugin.
 * pragma.notify.opening     : Lanzado inmediatamente después de llamarse al método [open()],
 * pragma.notify.open        : Lanzado al terminar el método [open()] y la notificación es visible para el usuario.
 * pragma.notify.closing     : Evento lanzado inmediatamente después de llamarse el método [close()].
 * pragma.notify.closed      : Evento lanzado cuando terminó de ejecutarse el método[close()] y la notificación 
 *                            es invisible para el usuario.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/notify.less
 * less/mixins/notify.less
 */
$(function( Pragma, $, undefined ) {
  "use strict";
  Pragma.Libs.Notify = function(element,options){
    var self = this;
    self.$el = element;
    self.options = options;
    self.timer = false;
    /**
     * Abre la notificación
     */
    self.open = function()
    {
      if(self.$el.hasClass("closing") || self.$el.hasClass("opening") || self.$el.hasClass("open"))
      {
        return;
      }
      self.$el.addClass("opening").trigger("pragma.notify.opening");
      set_position();
      window.setTimeout(function(){
        self.$el.addClass("open").css("display","none");
        self.fx.run(Pragma.Utils.get_instance_option(self, "fx", "open"), "open", function ()
        {
          self.$el.removeClass("opening").addClass("open").css("display","block");
          if(self.options.autoclose)
          {
            self.timer = new Pragma.Utils.timer(self.options.autoclose_time);
            self.timer.addCallback(function(){
              self.close();
            });
            self.timer.play();
          }
          self.$el.trigger("pragma.notify.open");
        });
      },self.options.open_delay);
    }
    /**
     * Cierra la notificación
     */
    self.close = function()
    {
      if(!self.$el.hasClass("open")||self.$el.hasClass("opening")||self.$el.hasClass("closing"))
      {
        return;
      }
      self.$el.addClass("closing").trigger("pragma.notify.closing");

      window.setTimeout(function(){
        self.fx.run(Pragma.Utils.get_instance_option(self, "fx", "close"), "close", function ()
        {
          self.$el.removeClass("closing open").css("display","none");
          if(self.timer !== false)
          {
            self.timer.stop();
            self.timer = false;
          }
          self.$el.trigger("pragma.notify.closed");
        });
      },self.options.close_delay);
    }
    /**
     * Si la notificación está abierta, la cerrará, de lo contrario, la abrirá.
     */
    self.toggle = function()
    {
      if(self.$el.hasClass("open"))
      {
        self.close();
      }
      else
      {
        self.open();
      }
    }
    /**
     * Método privado.
     * Configura la posición de la notificación.
     */
    function set_position()
    {
      self.$el.css({
        display: "block",
        visibility:"hidden",
        top:"initial",
        left:"initial",
        right:"initial",
        bottom:"initial",
        marginTop : 0,
        marginLeft: 0
      });
      var css = {
        display    : "none",
        visibility : "visible"
      };

      switch(self.options.position)
      {
        case "top left":
          css.top  = 30;
          css.left = 30;
        break;
        case "top center":
          css.top  = 30;
          css.left = "50%";
          css.marginLeft = (self.$el.outerWidth()*-0.5);
        break;
        case "top right":
          css.top   = 30;
          css.right = 30;
        break;

        case "bottom left":
          css.bottom = 30;
          css.left   = 30;
        break;
        case "bottom center":
          css.bottom     = 30;
          css.left       = "50%";
          css.marginLeft = (self.$el.outerWidth()*-0.5);
        break;
        case "bottom right":
          css.bottom = 30;
          css.right  = 30;
        break;
        case "center left":
          css.top = "50%";
          css.left = 30;
          css.marginTop = (self.$el.outerHeight()*-0.5);
        break;

        case "center center":
          css.top = "50%";
          css.left = "50%";
          css.marginTop = (self.$el.outerHeight()*-0.5);
          css.marginLeft = (self.$el.outerWidth()*-0.5);
        break;
        default:
          css.top       = "50%";
          css.right     = 30;
          css.marginTop = (self.$el.outerHeight()*-0.5);
        break;
      }
      self.$el.css(css);
    }

    /**
     * Método privado.
     * Configura los efectos del plugin.
     */
    function configure_fx()
    {
      self.fx = new Pragma.Utils.fx_manager();
      //Agrega el efecto "fade"
      self.fx.add("fade", function (action, callback)
      {
        var speed  = Pragma.Utils.get_instance_option(self, "fx_speed", action);
        var easing = Pragma.Utils.get_instance_option(self, "fx_easing", action);
        if (action == "open")
        {
          self.$el.finish().fadeIn(speed, easing, function () { callback(); });
        } else
        {
          self.$el.finish().fadeOut(speed, easing, function () { callback(); });
        }
      });

      self.fx.add("slide", function (action,callback){

        var position = self.options.position.split(" ");

        if(position.length == 2)
        {
          var speed  = Pragma.Utils.get_instance_option(self, "fx_speed", action);
          var easing = Pragma.Utils.get_instance_option(self, "fx_easing", action);
          self.$el.css({display:"block",visibility:"hidden"});
          var css = {visibility:"visible"};
          var animate = {};

          if(action == "open")
          {
            css.opacity = 0.2;
            animate.opacity = 1;
            //top left|top right|center left|center right|bottom left|bottom right
            if(position[1] == "left" || position[1] == "right")
            {
              css[position[1]] = -(self.$el.outerWidth());
              animate[position[1]] = 30;
            }
            //top center | bottom center
            else if(position[0] == "top" || position[0] == "bottom")
            {
              css[position[0]] = -(self.$el.outerHeight());
              animate[position[0]] = 30;
            }
            //center center
            else
            {
              css.top = -(self.$el.outerHeight());
              animate.top = "50%";
            }
          }
          else
          {
            css.opacity = 1;
            animate.opacity = 0.2;
            //top left|top right|center left|center right|bottom left|bottom right
            if(position[1] == "left" || position[1] == "right")
            {
              animate[position[1]] = -(self.$el.outerWidth());
            }
            else if(position[0] == "bottom")
            {
              animate[position[0]] = -(self.$el.outerHeight());
            }
            else
            {
              animate.top = -(self.$el.outerHeight());
            }
          }
          self.$el.css(css);
          self.$el.finish().animate(animate,speed,easing,function(){callback();});
        }
        else
        {
          callback();
        }
      });
    }
    /**
     * Método privado.
     * Configura el plugin.
     */
    function configure()
    {
      self.$el.trigger("pragma.notify.before_init");
      self.$el.appendTo(document.body);
      configure_fx();
      if(self.options.close_button && self.$el.find("notify-close").length == 0){
        $('<a href="#" class="notify-close">'+self.options.close_button_text+'</a>').click(function(e){
          e.preventDefault();
          self.close();
        }).prependTo(self.$el);
      }
      $(document).keyup(function(e) {
        if (e.keyCode == 27 && self.$el.hasClass("open") && self.options.esc_to_close)
        {
          e.stopPropagation();
          self.close();
        }
      });

      self.$el.mouseenter(function(e){
        if(self.timer !== false && self.options.autoclose && self.$el.hasClass("open"))
        {
          self.timer.pause();
        }
      });
      self.$el.mouseleave(function(e){
        if(self.timer !== false && self.options.autoclose && self.$el.hasClass("open"))
        {
          self.timer.play();
        }
      });

      if(self.options.autoclose)
      {
        self.timer = new Pragma.Utils.timer(self.options.auto_hide);
      }

      self.$el.trigger("pragma.notify.after_init");
    }
    configure();
  }

  //Versión del plugin
  Pragma.Libs.Notify.Ver = "1.0.0";

  Pragma.Libs.Notify.Defaults = {
    close_button : true, //Determina si se deberá agregar o no el botón para cerrar la notificación.
    esc_to_close : true, //Determina si la notificación se cerrará al presionar Esc.
    close_button_text : "&times;", //Define el texto del botón para cerrar la notificación.
    autoclose : true, //Determina si la notificación se cerrará automáticamente.
    autoclose_time : 5000, //Define el tiempo en el que la notificación se cerrará automáticamente.
    pause_on_hover: true, //Determina si se detendrá el timer mientras el puntero del mouse esté sobre la notificación.
    position : "center right", //posición de la notificación [top/center/bottom left/center/right]
    open_delay: 0, //Tiempo de espera antes de mostrar la notificación.
    close_delay: 0, //Tiempo de espera antes de cerrar la notificación.
    fx: "slide",//Efecto al abrir y cerrar la notificación [none,fade,slide]
    fx_speed: 300, //Velocidad del efecto al abrir y cerrar la notificación.
    fx_easing: false, //Efecto easing al abrir y cerrar la notificación.
    open_fx: "inherit", //Efecto al abrir la notificación [none,fade,slide,inherit]
    close_fx: "inherit", //Efecto al cerrar la notificación [none,fade,slide,inherit]
    open_fx_speed: "inherit", //Velocidad del efecto al abrir la notificación [milisegundos,inherit]
    close_fx_speed: "inherit",//Velocidad del efecto al cerrar la notificación [milisegundos,inherit]
    open_fx_easing: "inherit", //Efecto easing al abrir la notificación [nombre,inherit]
    close_fx_easing: "inherit" //Efecto easing al cerrar la notificación [nombre,inherit]
  };
  /**
   * Habilitando lanzadores con el atributo [data-notify-open].
   * Abrirá la notificación modal.
   */
  $(document).on('click.pragma.notify.open', '[data-notify-open]', function (e) {
    e.preventDefault();
    var $notify = $(this).data("Pragma.Notify");   
    if(!$notify){
      $notify = Pragma.Utils.get_target($(this),"notify-open");
      if($notify){
        $(this).data("Pragma.Notify",$notify);
      }
    }
    if($notify){
      $notify.pragma("notify","open");
    }
  });
  /**
   * Habilitando lanzadores con el atributo [data-notify-close].
   * Cerrará la notificación si está abierta.
   * Si no es especificado el objetivo, buscará la notificación padre.
   */
  $(document).on('click.pragma.notify.close', '[data-notify-close]', function (e) {
    e.preventDefault();
    var $notify = $(this).data("Pragma.Notify");   
    if(!$notify){
      $notify = Pragma.Utils.get_target($(this),"notify-close",false,".notify");
      if($notify){
        $(this).data("Pragma.Notify",$notify);
      }
    }
    if($notify){
      $notify.pragma("notify","close");
    }
  });
  /**
   * Habilitando lanzadores con el atributo [data-notify-toggle].
   * Si la notificación está abierta, la cerrará,de lo contrario, la abrirá.
   */
  $(document).on('click.pragma.notify.toggle', '[data-notify-toggle]', function (e) {
    e.preventDefault();
    var $notify = $(this).data("Pragma.Notify");   
    if(!$notify){
      $notify = Pragma.Utils.get_target($(this),"notify-toggle");
      if($notify){
        $(this).data("Pragma.Modal",$notify);
      }
    }
    if($notify){
      $notify.pragma("notify","toggle");
    }
  });

}( window.Pragma = window.Pragma || {}, jQuery ));

