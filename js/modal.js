/**
 * Pragma.Libs.Modal
 * Plugin para las ventanas modales.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-modal : define el plugin.
 * data-modal-options="[opciones]"     :   Opciones de configuración via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * Modal.open()     : Abre la ventana modal.
 * Modal.close([cerrar_bg])     : Cierra la ventana modal. Si el parámetro cerrar_bg está en false, dejará abierto el 
 *                                fondo.
 * Modal.closeAll()             : Cierra todas las ventanas modales abiertas.
 * Modal.toggle()               : Si la ventana modal está abierta, la cerrará, de lo contrario, la abrirá.   
 * Modal.get_bg()               : Devuelve la instancia del fondo de las ventanas modales. 
 *                                Si el mismo no ha sido creado, lo creará automáticamente.  
 * Modal.open_bg()              : Muestra el fondo de la ventana modal.
 * Modal.close_bg()             : Cierra el fondo de la ventana modal.
 * Modal.set_bg_style([estilo]) : Cambia el estilo del fondo de las ventanas modales.
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.modal.before_init : Lanzado al inicializar el plugin.
 * pragma.modal.after_init  : Lanzado al terminar la configuración inicial del plugin.
 * pragma.modal.opening     : Lanzado inmediatamente después de llamarse al método [open()],
 * pragma.modal.open        : Lanzado al terminar el método [open()] y la ventana modal es visible para el usuario.
 * pragma.modal.closing     : Evento lanzado inmediatamente después de llamarse el método [close()].
 * pragma.modal.closed      : Evento lanzado cuando terminó de ejecutarse el método[close()] y la ventana modal 
 *                            es invisible para el usuario.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/modal.less
 */
$(function( Pragma, $, undefined ) {
  "use strict";
  Pragma.Libs.Modal = function (element, options) {
    var self = this;
    self.options = options;
    self.$el = element;
    self.$bg;
    /**
     * Devuelve la instancia del fondo de las ventanas modales.
     * Si la misma no existe, la creará automáticamente.
     * @return {object}
     */
    self.get_bg = function()
    {
      if($(document.body).find(".modal-bg").length == 0)
      {
        $(document.body).append('<div class="modal-bg"></div>');
      }
      return $(document.body).find(".modal-bg");
    }
    /**
     * Establece el estilo del fondo de la ventana modal.
     * @param {string} color Estilo de color. Puede ser "light","dark" o "transparent". Por defecto "dark".
     */
    self.set_bg_style = function(style)
    {
      self.get_bg().removeClass("light dark transparent").addClass(style);
    }
    /**
     * Abre el fondo de la ventana modal.
     */
    self.open_bg = function()
    {
      if(!self.get_bg().hasClass("open"))
      {
        $(document.body).css("overflow","hidden");
        self.set_bg_style(self.options.bg_style);
        self.get_bg().finish().fadeIn(self.options.bg_fx_speed,function()
          {
            $(this).addClass("open");
          });
      }
    }
    /**
     * Cierra el fondo de la ventana modal.
     */
    self.close_bg = function()
    {
      if(self.get_bg().hasClass("open"))
      {
        self.get_bg().fadeOut(self.options.bg_fx_speed,function()
          {
            $(this).removeClass("open");$(document.body).css("overflow","auto");
          });
      }
    }
    /**
     * Cierra todas las ventanas modales.
     */
    self.close_all = function()
    {
      self.get_bg().find(".modal").each(function(){
        $(this).pragma("modal","close");
      });
    }
    /**
     * Abre la ventana modal.
     */
    self.open = function()
    {
      if(self.$el.hasClass("open"))
      {
        return;
      }
      self.$el.trigger("pragma.modal.opening");
      if(!self.$el.parent().hasClass("modal-bg"))
      {
        self.$el.appendTo(self.get_bg());
      }
      var delay = self.options.bg_fx_speed;
      if(self.get_bg().hasClass("open"))
      {
        delay = 0;
        self.get_bg().find(".modal").each(function(){
          if($(this).hasClass("open") && $(this).data("Pragma.Modal") !== undefined)
          {
            if(delay < Pragma.Utils.get_instance_option($(this).data("Pragma.Modal"), "fx_speed", "close"))
            {
              delay = Pragma.Utils.get_instance_option($(this).data("Pragma.Modal"), "fx_speed", "close");
            }
            $(this).pragma("modal","close",false);
          }
        });
        delay = delay*1.5;
      }
      self.open_bg();
      delay = delay + self.options.open_delay;
      window.setTimeout(function(){
        self.$el.addClass("open").css("display","none");
        self.fx.run(Pragma.Utils.get_instance_option(self, "fx", "open"), "open", function ()
        {
          self.$el.addClass("open").css("display","block");
          self.$el.trigger("pragma.modal.open");
        });
      },delay);
    }
    /**
     * Cierra la ventana modal
     * @param  {bool} close_bg Determina si al cerrar la ventana modal también deberá cerrar el fondo.
     *                         Por defecto true.
     */
    self.close = function(close_bg)
    {
      if(self.$el.hasClass("open"))
      {
        self.$el.trigger("pragma.modal.closing");
        window.setTimeout(function(){
          self.fx.run(Pragma.Utils.get_instance_option(self, "fx", "close"), "close", function ()
          {
            self.$el.removeClass("open").css("display","none");
            if(close_bg !== false)
            {
              self.close_bg();
              window.setTimeout(function(){
                self.$el.trigger("pragma.modal.closed");
              },self.options.bg_fx_speed)
            }
          });
        },self.options.close_delay);
      }
    }
    /**
     * Si la ventana modal está abierta, la cerrará, de lo contrario, la abrirá.
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
     * Configura los efectos del plugin.
     */
    function configure_fx()
    {
      self.fx = new Pragma.Utils.fx_manager();
      //Agrega el efecto "fade"
      self.fx.add("fade", function (action, callback)
      {
        var speed = Pragma.Utils.get_instance_option(self, "fx_speed", action);
        var easing = Pragma.Utils.get_instance_option(self, "fx_easing", action);
        if (action == "open")
        {
          self.$el.finish().fadeIn(speed, easing, function () { callback(); });
        } else
        {
          self.$el.finish().fadeOut(speed, easing, function () { callback(); });
        }
      });
      self.fx.add("slide", function (action, callback)
      {
        var speed = Pragma.Utils.get_instance_option(self, "fx_speed", action);
        var easing = Pragma.Utils.get_instance_option(self, "fx_easing", action);

        if (action == "open")
        {
          self.$el.css({display:"block",visibility:"hidden"});
          var height = (self.$el.outerHeight()*-2);
          self.$el.css({visibility:"visible",marginTop : height,opacity: 0.2});
          self.$el.finish().animate({marginTop:0,opacity:1},speed, easing, function () { callback(); });
        } else
        {
          var height = (self.$el.outerHeight()*-2);
          self.$el.finish().animate({marginTop: height,opacity:0.2},speed, easing, function () { 
            self.$el.css({marginTop:0,opacity:0.2});
            callback();
          });
        }
      });
    }
    /**
     * Método privado.
     * Configura el plugin.
     */
    function configure()
    {
      self.$el.trigger("pragma.modal.before_init");
      configure_fx();
      if(self.options.close_button && self.$el.find("modal-close").length == 0){
        $('<a href="#" class="modal-close">'+self.options.close_button_text+'</a>').click(function(e){
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
      self.$el.trigger("pragma.modal.after_init");
    }
    configure();
  }
  //Versión del plugin
  Pragma.Libs.Modal.Ver = "1.0.0";
  /**Opciones**/
  Pragma.Libs.Modal.Defaults = {
    close_button : true, //Determina si se deberá agregar o no el botón para cerrar la ventana modal.
    esc_to_close : true, //Determina si la ventana modal se cerrará al presionar Esc.
    close_button_text : "&times;", //Define el texto del botón para cerrar la ventana modal.
    bg_style : "dark", //Define el estilo de la ventana modal. Opciones [dark,light,transparent]
    open_delay: 0, //Tiempo de espera antes de mostrar la ventana modal.
    close_delay: 0, //Tiempo de espera antes de cerrar la ventana modal.
    fx: "slide",//Efecto al abrir y cerrar la ventana modal [none,fade,slide]
    fx_speed: 300, //Velocidad del efecto al abrir y cerrar la ventana modal.
    fx_easing: false, //Efecto easing al abrir y cerrar la ventana modal.
    open_fx: "inherit", //Efecto al abrir la ventana modal [none,fade,slide,inherit]
    close_fx: "inherit", //Efecto al cerrar la ventana modal [none,fade,slide,inherit]
    open_fx_speed: "inherit", //Velocidad del efecto al abrir la ventana modal [milisegundos,inherit]
    close_fx_speed: "inherit",//Velocidad del efecto al cerrar la ventana modal [milisegundos,inherit]
    open_fx_easing: "inherit", //Efecto easing al abrir la ventana modal [nombre,inherit]
    close_fx_easing: "inherit" //Efecto easing al cerrar la ventana modal [nombre,inherit]
  };


  /**
   * Habilitando lanzadores con el atributo [data-modal-open].
   * Abrirá la ventana modal.
   * Si no es especificado el objetivo, buscará el modal más cerca después del elemento.
   */
  $(document).on('click.pragma.modal.open', '[data-modal-open]', function (e) {
    e.preventDefault();
    var $modal = $(this).data("Pragma.Modal");   
    if(!$modal){
      $modal = Pragma.Utils.get_target($(this),"modal-open");
      if($modal){
        $(this).data("Pragma.Modal",$modal);
      }
    }
    if($modal){
      $modal.pragma("modal","open");
    }
  });
  /**
   * Habilitando lanzadores con el atributo [data-modal-close].
   * Cerrará la ventana modal si está abierta.
   * Si no es especificado el objetivo, buscará el modal padre.
   */
  $(document).on('click.pragma.modal.close', '[data-modal-close]', function (e) {
    e.preventDefault();
    var $modal = $(this).data("Pragma.Modal");   
    if(!$modal){
      $modal = Pragma.Utils.get_target($(this),"modal-close",false,".modal");
      if($modal){
        $(this).data("Pragma.Modal",$modal);
      }
    }
    if($modal){
      $modal.pragma("modal","close");
    }
  });

  /**
   * Habilitando lanzadores con el atributo [data-modal-toggle].
   * Si la ventana modal está abierta, la cerrará,de lo contrario, la abrirá.
   */
  $(document).on('click.pragma.modal.toggle', '[data-modal-toggle]', function (e) {
    e.preventDefault();
    var $modal = $(this).data("Pragma.Modal");   
    if(!$modal){
      $modal = Pragma.Utils.get_target($(this),"modal-toggle");
      if($modal){
        $(this).data("Pragma.Modal",$modal);
      }
    }
    if($modal){
      $modal.pragma("modal","toggle");
    }
  });
}( window.Pragma = window.Pragma || {}, jQuery ));